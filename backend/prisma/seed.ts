import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, PerfilUsuario } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertRegiao(nomeRegiao: string, uf: string, codigoIbge: string, latitude: number, longitude: number) {
  const existing = (await prisma.regiaoProdutora.findUnique({ where: { codigoIbge } })) ??
    (await prisma.regiaoProdutora.findFirst({ where: { nomeRegiao, pais: 'Brasil' } }));
  return existing
    ? prisma.regiaoProdutora.update({
        where: { id: existing.id },
        data: { nomeRegiao, pais: 'Brasil', uf, codigoIbge, latitude, longitude },
      })
    : prisma.regiaoProdutora.create({
        data: { nomeRegiao, pais: 'Brasil', uf, codigoIbge, latitude, longitude },
      });
}

async function main() {
  const senhaHash = await bcrypt.hash('Dev123456!', 10);
  const tecnico = await prisma.usuario.upsert({
    where: { email: 'tecnico@cafe-pi.local' },
    update: { senhaHash, nome: 'Técnico de Desenvolvimento', perfil: PerfilUsuario.TECNICO },
    create: {
      email: 'tecnico@cafe-pi.local',
      senhaHash,
      nome: 'Técnico de Desenvolvimento',
      perfil: PerfilUsuario.TECNICO,
    },
  });

  const culturas = [
    ['Café', 'cafe'], ['Cana-de-açúcar', 'cana-de-acucar'], ['Soja', 'soja'],
    ['Milho', 'milho'], ['Laranja', 'laranja'], ['Feijão', 'feijao'],
  ] as const;
  for (const [nome, slug] of culturas) {
    await prisma.cultura.upsert({ where: { slug }, update: { nome }, create: { nome, slug } });
  }

  const cafe = await prisma.cultura.findUniqueOrThrow({ where: { slug: 'cafe' } });

  const regioes = await Promise.all([
    upsertRegiao('Franca', 'SP', '3516200', -20.5386, -47.4008),
    upsertRegiao('Patrocínio', 'MG', '3148103', -18.9186, -46.9988),
    upsertRegiao('Venda Nova do Imigrante', 'ES', '3205069', -20.3264, -41.1358),
  ]);

  for (const regiao of regioes) {
    await prisma.usuario.update({
      where: { id: tecnico.id },
      data: { regioes: { connect: { id: regiao.id } } },
    });
  }

  const clima = [
    [regioes[0], 21.5, 130, 70, 5.2],
    [regioes[1], 24.2, 90, 62, 6.1],
    [regioes[2], 19.8, 180, 78, 4.6],
  ] as const;

  for (const [regiao, temperaturaMedia, precipitacao, umidade, radiacaoSolar] of clima) {
    const data = new Date('2026-01-15T00:00:00.000Z');
    const existing = await prisma.condicaoClimatica.findFirst({
      where: { regiaoId: regiao.id, data },
    });
    if (existing) {
      await prisma.condicaoClimatica.update({
        where: { id: existing.id },
        data: { temperaturaMedia, precipitacao, umidade, radiacaoSolar },
      });
    } else {
      await prisma.condicaoClimatica.create({
        data: { regiaoId: regiao.id, data, temperaturaMedia, precipitacao, umidade, radiacaoSolar },
      });
    }
  }

  for (const [index, regiao] of regioes.entries()) {
    await prisma.safraRendimento.upsert({
      where: { regiaoId_culturaId_anoColheita: { regiaoId: regiao.id, culturaId: cafe.id, anoColheita: 2025 } },
      update: { culturaId: cafe.id, areaColhidaHa: 100 + index * 20, producaoT: 150 + index * 30, diasCrescimento: 240 + index * 5, rendimentoToneladasHectare: 1.5 + index * 0.2 },
      create: {
        regiaoId: regiao.id,
        culturaId: cafe.id,
        areaColhidaHa: 100 + index * 20,
        producaoT: 150 + index * 30,
        anoColheita: 2025,
        diasCrescimento: 240 + index * 5,
        rendimentoToneladasHectare: 1.5 + index * 0.2,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
