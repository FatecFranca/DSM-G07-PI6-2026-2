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
  const culturasSeed = await prisma.cultura.findMany({
    where: { slug: { in: culturas.map(([, slug]) => slug) } },
  });
  const culturaPorSlug = new Map(culturasSeed.map((cultura) => [cultura.slug, cultura]));
  const cultura = (slug: string) => {
    const item = culturaPorSlug.get(slug);
    if (!item) throw new Error(`Cultura não encontrada no seed: ${slug}`);
    return item;
  };

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

  const versaoDados = 'seed-2026';
  const climatologias = [
    { temperaturaMedia: 21.5, temperaturaMin: 15.2, chuvaMediaDiaria: 3.6, chuvaAnual: 1460, umidade: 70, radiacaoSolar: 5.2, temperaturaJaneiro: 23.4, temperaturaJulho: 18.1, temperaturaMinimaJulho: 11.8, chuvaEstacaoSeca: 1.2, chuvaVerao: 5.8, amplitudeTermica: 11.6, contrasteChuva: 4.6, periodoInicio: 2016, periodoFim: 2025 },
    { temperaturaMedia: 24.2, temperaturaMin: 17.1, chuvaMediaDiaria: 2.9, chuvaAnual: 1180, umidade: 62, radiacaoSolar: 6.1, temperaturaJaneiro: 25.8, temperaturaJulho: 20.2, temperaturaMinimaJulho: 13.5, chuvaEstacaoSeca: 0.9, chuvaVerao: 4.9, amplitudeTermica: 12.3, contrasteChuva: 4.0, periodoInicio: 2016, periodoFim: 2025 },
    { temperaturaMedia: 19.8, temperaturaMin: 13.4, chuvaMediaDiaria: 4.9, chuvaAnual: 1810, umidade: 78, radiacaoSolar: 4.6, temperaturaJaneiro: 21.2, temperaturaJulho: 16.5, temperaturaMinimaJulho: 9.8, chuvaEstacaoSeca: 2.4, chuvaVerao: 7.1, amplitudeTermica: 10.4, contrasteChuva: 4.7, periodoInicio: 2016, periodoFim: 2025 },
  ] as const;
  for (const [index, regiao] of regioes.entries()) {
    await prisma.climaRegiao.upsert({
      where: { regiaoId_versaoDados: { regiaoId: regiao.id, versaoDados } },
      update: { ...climatologias[index] },
      create: { regiaoId: regiao.id, versaoDados, ...climatologias[index] },
    });
  }

  const versaoModelo = 'demo-2026-1';
  const clusterPerfis = [
    { grupo: 1, nomeGrupo: 'Alta radiação e inverno seco', quantidadeMunicipios: 1, variaveis: { temperaturaMedia: 21.5, chuvaAnual: 1460, radiacaoSolar: 5.2 } },
    { grupo: 2, nomeGrupo: 'Clima quente e menor chuva', quantidadeMunicipios: 1, variaveis: { temperaturaMedia: 24.2, chuvaAnual: 1180, radiacaoSolar: 6.1 } },
    { grupo: 3, nomeGrupo: 'Mais chuva e temperaturas amenas', quantidadeMunicipios: 1, variaveis: { temperaturaMedia: 19.8, chuvaAnual: 1810, radiacaoSolar: 4.6 } },
  ] as const;
  for (const perfil of clusterPerfis) {
    await prisma.clusterPerfil.upsert({
      where: { grupo_versaoModelo: { grupo: perfil.grupo, versaoModelo } },
      update: perfil,
      create: { ...perfil, versaoModelo },
    });
  }
  for (const [index, regiao] of regioes.entries()) {
    const grupo = index + 1;
    await prisma.clusterRegiao.upsert({
      where: { regiaoId_versaoModelo: { regiaoId: regiao.id, versaoModelo } },
      update: { grupo, nomeGrupo: clusterPerfis[index].nomeGrupo },
      create: { regiaoId: regiao.id, grupo, nomeGrupo: clusterPerfis[index].nomeGrupo, versaoModelo },
    });
  }

  const compatibilidadeBase = [
    [0.91, 0.84, 0.72, 0.66],
    [0.76, 0.89, 0.86, 0.61],
    [0.94, 0.68, 0.63, 0.78],
  ] as const;
  const culturasCompatibilidade = ['cafe', 'soja', 'milho', 'cana-de-acucar'];
  for (const [regiaoIndex, regiao] of regioes.entries()) {
    for (const [culturaIndex, slug] of culturasCompatibilidade.entries()) {
      const item = cultura(slug);
      const score = compatibilidadeBase[regiaoIndex][culturaIndex];
      await prisma.compatibilidadeCultura.upsert({
        where: { regiaoId_culturaId_versaoModelo: { regiaoId: regiao.id, culturaId: item.id, versaoModelo } },
        update: { compatibilidade: score, ranking: culturaIndex + 1, aptoReal: score >= 0.75, aviso: 'Resultado demonstrativo para apresentação.' },
        create: { regiaoId: regiao.id, culturaId: item.id, versaoModelo, compatibilidade: score, ranking: culturaIndex + 1, aptoReal: score >= 0.75, aviso: 'Resultado demonstrativo para apresentação.' },
      });
    }
  }

  const metricas = [
    { slug: 'cafe', algoritmo: 'Random Forest', acuracia: 0.88, acuraciaBalanceada: 0.84, precisao: 0.86, recall: 0.82, f1: 0.84, auc: 0.91, baseline: 0.62, matrizConfusao: [[42, 6], [8, 44]] },
    { slug: 'soja', algoritmo: 'Gradient Boosting', acuracia: 0.83, acuraciaBalanceada: 0.81, precisao: 0.82, recall: 0.79, f1: 0.80, auc: 0.87, baseline: 0.59, matrizConfusao: [[39, 9], [10, 42]] },
    { slug: 'milho', algoritmo: 'Random Forest', acuracia: 0.79, acuraciaBalanceada: 0.76, precisao: 0.78, recall: 0.74, f1: 0.76, auc: 0.84, baseline: 0.56, matrizConfusao: [[36, 12], [13, 39]] },
  ] as const;
  for (const metrica of metricas) {
    const culturaItem = cultura(metrica.slug);
    const existing = await prisma.metricaModelo.findFirst({ where: { culturaId: culturaItem.id, algoritmo: metrica.algoritmo, versaoModelo } });
    const data = { culturaId: culturaItem.id, algoritmo: metrica.algoritmo, versaoModelo, acuracia: metrica.acuracia, acuraciaBalanceada: metrica.acuraciaBalanceada, precisao: metrica.precisao, recall: metrica.recall, f1: metrica.f1, auc: metrica.auc, baseline: metrica.baseline, matrizConfusao: metrica.matrizConfusao };
    if (existing) await prisma.metricaModelo.update({ where: { id: existing.id }, data });
    else await prisma.metricaModelo.create({ data });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
