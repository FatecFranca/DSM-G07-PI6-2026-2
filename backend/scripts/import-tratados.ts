import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

type Row = Record<string, string>;

function parseCsv(content: string): Row[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? '']),
    );
  });
}

async function csv(path: string) {
  return parseCsv(await readFile(path, 'utf8'));
}

function numberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Valor numérico inválido: ${value}`);
  }
  return parsed;
}

async function main() {
  const [, , climatePath, harvestPath, regionUfPath] = process.argv;
  if (!climatePath && !harvestPath) {
    throw new Error(
      'Uso: npm run data:import -- [clima.csv] [safra.csv] [regiao-uf.csv]',
    );
  }

  const prisma = new PrismaClient();
  try {
    if (climatePath) {
      for (const row of await csv(climatePath)) {
        const regiao = await prisma.regiaoProdutora.findUnique({
          where: { id: row.regiaoId },
        });
        if (!regiao) throw new Error(`Região não encontrada: ${row.regiaoId}`);
        const data = new Date(`${row.data}T00:00:00.000Z`);
        if (Number.isNaN(data.getTime())) throw new Error(`Data inválida: ${row.data}`);
        const values = {
          temperaturaMedia: numberOrNull(row.temperaturaMedia),
          precipitacao: numberOrNull(row.precipitacao),
          umidade: numberOrNull(row.umidade),
          radiacaoSolar: numberOrNull(row.radiacaoSolar),
        };
        const existing = await prisma.condicaoClimatica.findFirst({
          where: { regiaoId: row.regiaoId, data },
          select: { id: true },
        });
        if (existing) {
          await prisma.condicaoClimatica.update({ where: { id: existing.id }, data: values });
        } else {
          await prisma.condicaoClimatica.create({
            data: { regiaoId: row.regiaoId, data, ...values },
          });
        }
      }
    }

    if (harvestPath) {
      if (!regionUfPath) throw new Error('Informe também o CSV de correspondência região/UF');
      const mappings = await csv(regionUfPath);
      const regionsByUf = new Map(mappings.map((row) => [row.uf.toUpperCase(), row.regiaoId]));
      for (const row of await csv(harvestPath)) {
        const regiaoId = regionsByUf.get(row.uf.toUpperCase());
        if (!regiaoId) throw new Error(`UF sem região correspondente: ${row.uf}`);
        const rendimento = numberOrNull(row.rendimentoToneladasHectare);
        await prisma.safraRendimento.upsert({
          where: {
            regiaoId_anoColheita: {
              regiaoId,
              anoColheita: Number(row.anoColheita),
            },
          },
          update: { rendimentoToneladasHectare: rendimento },
          create: {
            regiaoId,
            anoColheita: Number(row.anoColheita),
            rendimentoToneladasHectare: rendimento,
          },
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
