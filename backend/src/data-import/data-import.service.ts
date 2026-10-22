import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { PrismaService } from '../prisma/prisma.service';

type Row = Record<string, string>;

function parseCsv(content: string): Row[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const values = line.split(',');
      return Object.fromEntries(
        headers.map((header, index) => [header, values[index]?.trim() ?? '']),
      );
    });
}

function numberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Valor numérico inválido: ${value}`);
  }
  return parsed;
}

@Injectable()
export class DataImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importTreatedFiles(
    climatePath?: string,
    harvestPath?: string,
    regionUfPath?: string,
  ): Promise<void> {
    if (!climatePath && !harvestPath) {
      throw new Error('Informe pelo menos um arquivo tratado para importar');
    }

    if (climatePath) {
      const rows = parseCsv(await readFile(climatePath, 'utf8'));
      for (const row of rows) {
        const regiao = await this.prisma.regiaoProdutora.findUnique({
          where: { id: row.regiaoId },
        });
        if (!regiao) throw new Error(`Região não encontrada: ${row.regiaoId}`);
        const data = new Date(`${row.data}T00:00:00.000Z`);
        if (Number.isNaN(data.getTime())) {
          throw new Error(`Data inválida: ${row.data}`);
        }
        const values = {
          temperaturaMedia: numberOrNull(row.temperaturaMedia),
          precipitacao: numberOrNull(row.precipitacao),
          umidade: numberOrNull(row.umidade),
          radiacaoSolar: numberOrNull(row.radiacaoSolar),
        };
        const existing = await this.prisma.condicaoClimatica.findFirst({
          where: { regiaoId: row.regiaoId, data },
          select: { id: true },
        });
        if (existing) {
          await this.prisma.condicaoClimatica.update({
            where: { id: existing.id },
            data: values,
          });
        } else {
          await this.prisma.condicaoClimatica.create({
            data: { regiaoId: row.regiaoId, data, ...values },
          });
        }
      }
    }

    if (harvestPath) {
      if (!regionUfPath) {
        throw new Error('Informe o CSV de correspondência região/UF');
      }
      const mappings = parseCsv(await readFile(regionUfPath, 'utf8'));
      const regionsByUf = new Map(
        mappings.map((row) => [row.uf.toUpperCase(), row.regiaoId]),
      );
      for (const row of parseCsv(await readFile(harvestPath, 'utf8'))) {
        const regiaoId = regionsByUf.get(row.uf.toUpperCase());
        if (!regiaoId) {
          throw new Error(`UF sem região correspondente: ${row.uf}`);
        }
        const anoColheita = Number(row.anoColheita);
        if (!Number.isInteger(anoColheita) || anoColheita < 1900) {
          throw new Error(`Ano de colheita inválido: ${row.anoColheita}`);
        }
        const rendimento = numberOrNull(row.rendimentoToneladasHectare);
        const culturaSlug = row.culturaSlug || row.cultura || 'cafe';
        const cultura = await this.prisma.cultura.findUnique({
          where: { slug: culturaSlug },
          select: { id: true },
        });
        if (!cultura) {
          throw new Error(`Cultura nÃ£o encontrada: ${culturaSlug}`);
        }
        await this.prisma.safraRendimento.upsert({
          where: {
            regiaoId_culturaId_anoColheita: {
              regiaoId,
              culturaId: cultura.id,
              anoColheita,
            },
          },
          update: { rendimentoToneladasHectare: rendimento },
          create: {
            regiaoId,
            culturaId: cultura.id,
            anoColheita,
            rendimentoToneladasHectare: rendimento,
          },
        });
      }
    }
  }
}
