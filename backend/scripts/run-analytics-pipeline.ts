import 'dotenv/config';
import { constants } from 'node:fs';
import { access, mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { spawn } from 'node:child_process';

type PipelineMode = 'artifact-only' | 'full';
type PipelineStatus = 'running' | 'succeeded' | 'failed' | 'skipped';
type RunResult = Exclude<PipelineStatus, 'running'>;

type PipelineState = {
  status: PipelineStatus;
  mode: PipelineMode;
  startedAt: string;
  finishedAt?: string;
  artifactPath: string;
  error?: string;
};

const repositoryRoot = resolve(__dirname, '..', '..');
const analyticsRoot = resolve(repositoryRoot, 'analytics');
const notebooksRoot = resolve(analyticsRoot, 'notebooks');
const defaultArtifactPath = resolve(
  analyticsRoot,
  'data',
  'processed',
  'artefato_agricola_v1.json',
);
const mode = parseMode(process.env.ANALYTICS_PIPELINE_MODE);
const artifactPath = resolveFromRoot(
  process.env.ANALYTICS_ARTIFACT_PATH,
  defaultArtifactPath,
);
const lockPath = resolveFromRoot(
  process.env.ANALYTICS_LOCK_PATH,
  resolve(analyticsRoot, '.pipeline.lock'),
);
const statusPath = resolveFromRoot(
  process.env.ANALYTICS_STATUS_PATH,
  resolve(analyticsRoot, 'data', 'pipeline-status.json'),
);
const intervalMs =
  parsePositiveNumber(process.env.ANALYTICS_PIPELINE_INTERVAL_MINUTES, 1440) *
  60_000;
const runOnce = process.env.ANALYTICS_PIPELINE_RUN_ONCE === 'true';
const pythonCommand = process.env.ANALYTICS_PYTHON_COMMAND || 'python';
const jupyterCommand = process.env.ANALYTICS_JUPYTER_COMMAND || 'jupyter';

let stopping = false;

function parseMode(value: string | undefined): PipelineMode {
  if (!value || value === 'artifact-only') return 'artifact-only';
  if (value === 'full') return 'full';
  throw new Error(
    'ANALYTICS_PIPELINE_MODE deve ser "artifact-only" ou "full".',
  );
}

function parsePositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('ANALYTICS_PIPELINE_INTERVAL_MINUTES deve ser positivo.');
  }
  return parsed;
}

function resolveFromRoot(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  return isAbsolute(value) ? value : resolve(repositoryRoot, value);
}

async function writeState(state: PipelineState) {
  await mkdir(dirname(statusPath), { recursive: true });
  await writeFile(statusPath, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  label: string,
): Promise<void> {
  return new Promise((resolveCommand, rejectCommand) => {
    console.log(`[pipeline] ${label}: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.once('error', rejectCommand);
    child.once('exit', (code, signal) => {
      if (code === 0) return resolveCommand();
      rejectCommand(
        new Error(
          `${label} terminou com código ${code ?? 'desconhecido'}${
            signal ? ` (${signal})` : ''
          }.`,
        ),
      );
    });
  });
}

async function runFullPipeline() {
  await runCommand(
    pythonCommand,
    ['scripts/coletar_clima_municipios.py'],
    analyticsRoot,
    'coleta de clima',
  );
  await runCommand(
    pythonCommand,
    ['scripts/coletar_ibge_pam.py'],
    analyticsRoot,
    'coleta agrícola',
  );

  const temporaryOutput = resolve(
    analyticsRoot,
    'data',
    `.executed-notebooks-${process.pid}`,
  );
  await mkdir(temporaryOutput, { recursive: true });
  try {
    for (const notebook of [
      '00_preprocessamento.ipynb',
      '02_correlacao.ipynb',
      '03_kmeans.ipynb',
      '04_classificacao.ipynb',
      '01_ingestao.ipynb',
    ]) {
      await runCommand(
        jupyterCommand,
        [
          'nbconvert',
          '--to',
          'notebook',
          '--execute',
          '--ExecutePreprocessor.cwd=' + notebooksRoot,
          '--output-dir=' + temporaryOutput,
          notebook,
        ],
        notebooksRoot,
        `execução de ${notebook}`,
      );
    }
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
}

async function importArtifact() {
  await access(artifactPath, constants.R_OK);
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await runCommand(
    npmCommand,
    ['run', 'data:import:agricultural', '--', artifactPath],
    resolve(repositoryRoot, 'backend'),
    'importação do artefato',
  );
}

async function executeOnce(): Promise<RunResult> {
  await mkdir(dirname(lockPath), { recursive: true });
  let lock;
  try {
    lock = await open(lockPath, 'wx');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      console.warn('[pipeline] execução ignorada: já existe um lock ativo.');
      await writeState({
        status: 'skipped',
        mode,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        artifactPath,
      });
      return 'skipped';
    }
    throw error;
  }

  const startedAt = new Date().toISOString();
  await writeFile(lockPath, `${process.pid}\n`, 'utf8');
  await writeState({ status: 'running', mode, startedAt, artifactPath });
  try {
    if (mode === 'full') await runFullPipeline();
    await importArtifact();
    await writeState({
      status: 'succeeded',
      mode,
      startedAt,
      finishedAt: new Date().toISOString(),
      artifactPath,
    });
    console.log('[pipeline] execução concluída com sucesso.');
    return 'succeeded';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeState({
      status: 'failed',
      mode,
      startedAt,
      finishedAt: new Date().toISOString(),
      artifactPath,
      error: message,
    });
    console.error(`[pipeline] execução falhou: ${message}`);
    return 'failed';
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

async function main() {
  console.log(
    `[pipeline] worker iniciado; modo=${mode}; intervalo=${intervalMs / 60_000} min.`,
  );
  do {
    const result = await executeOnce();
    if (runOnce && result === 'failed') process.exitCode = 1;
    if (runOnce || stopping) break;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, intervalMs));
  } while (!stopping);
}

function stop() {
  stopping = true;
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

void main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[pipeline] erro fatal: ${message}`);
  try {
    const state = JSON.parse(
      await readFile(statusPath, 'utf8'),
    ) as PipelineState;
    await writeState({
      ...state,
      status: 'failed',
      finishedAt: new Date().toISOString(),
      error: message,
    });
  } catch {
    // O erro original já foi enviado ao stderr; não ocultar falha de diagnóstico.
  }
  process.exitCode = 1;
});
