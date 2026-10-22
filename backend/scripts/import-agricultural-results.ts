import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Prisma, PrismaClient } from '@prisma/client';

type Artifact = {
 schemaVersion: number; modelVersion: string; dataVersion?: string;
 cultures: { name: string; slug: string }[];
 municipalities: { code: string; name: string; uf: string; latitude?: number|null; longitude?: number|null }[];
 harvests: { code: string; crop: string; year: number; areaHa?: number|null; productionT?: number|null; yieldTPerHa?: number|null }[];
 climate: { code: string; avgTemp?: number|null; minTemp?: number|null; avgDailyRain?: number|null; annualRain?: number|null; humidity?: number|null; solarRadiation?: number|null; januaryTemp?: number|null; julyTemp?: number|null; julyMinTemp?: number|null; drySeasonRain?: number|null; summerRain?: number|null; thermalAmplitude?: number|null; rainfallContrast?: number|null; periodStart?: number|null; periodEnd?: number|null }[];
 clusters: { code: string; group: number; groupName?: string|null }[];
 clusterProfiles: { group: number; name?: string|null; municipalityCount: number; variables: Record<string, unknown> }[];
 compatibilities: { code: string; crop: string; score: number; rank?: number|null; observedLabel?: boolean|null; notice?: string|null }[];
 metrics: { crop: string; algorithm: string; accuracy?: number|null; balancedAccuracy?: number|null; precision?: number|null; recall?: number|null; f1?: number|null; auc?: number|null; baseline?: number|null; confusionMatrix?: unknown; }[];
};
const prisma = new PrismaClient();
function validate(a: Artifact) {
 if (a.schemaVersion !== 1 || !a.modelVersion) throw new Error('schemaVersion 1 e modelVersion são obrigatórios.');
 if (!Array.isArray(a.cultures) || !Array.isArray(a.municipalities)) throw new Error('cultures e municipalities são obrigatórios.');
 const codes = new Set<string>(); for (const m of a.municipalities) { if (!/^\d{7}$/.test(m.code) || !['ES','MG','SP'].includes(m.uf)) throw new Error('Código IBGE/UF inválido: ' + m.code); if (m.latitude != null && (m.latitude < -90 || m.latitude > 90)) throw new Error('Latitude inválida: ' + m.code); if (m.longitude != null && (m.longitude < -180 || m.longitude > 180)) throw new Error('Longitude inválida: ' + m.code); if (codes.has(m.code)) throw new Error('Município duplicado: ' + m.code); codes.add(m.code); }
 const crops = new Set(a.cultures.map(c=>c.slug)); for (const row of [...(a.harvests||[]), ...(a.compatibilities||[])]) { if (!codes.has(row.code)) throw new Error('Código municipal inexistente: ' + row.code); if (!crops.has(row.crop)) throw new Error('Cultura inexistente: ' + row.crop); }
 for (const row of [...(a.climate||[]), ...(a.clusters||[])]) if (!codes.has(row.code)) throw new Error('Código municipal inexistente: ' + row.code);
 
 for (const row of a.compatibilities||[]) if (row.score<0||row.score>1) throw new Error('Compatibilidade deve estar entre 0 e 1.');
}
async function main() {
 const path = process.argv[2]; if (!path) throw new Error('Uso: npm run data:import:agricultural -- arquivo.json');
 const artifact = JSON.parse(await readFile(path,'utf8')) as Artifact; validate(artifact);
 const summary = await prisma.$transaction(async tx => {
  const crops = new Map<string,string>();
  for (const c of artifact.cultures) { const row=await tx.cultura.upsert({where:{slug:c.slug},update:{nome:c.name},create:{nome:c.name,slug:c.slug}}); crops.set(c.slug,row.id); }
  const municipalities = new Map<string,string>();
  for (const m of artifact.municipalities) { const row=await tx.regiaoProdutora.upsert({where:{codigoIbge:m.code},update:{nomeRegiao:m.name,uf:m.uf,pais:'Brasil',latitude:m.latitude??null,longitude:m.longitude??null},create:{codigoIbge:m.code,nomeRegiao:m.name,uf:m.uf,pais:'Brasil',latitude:m.latitude??null,longitude:m.longitude??null}}); municipalities.set(m.code,row.id); }
  const version=artifact.modelVersion; const dataVersion=artifact.dataVersion || version;
  await tx.compatibilidadeCultura.deleteMany({where:{versaoModelo:version}});
  await tx.clusterRegiao.deleteMany({where:{versaoModelo:version}});
  await tx.clusterPerfil.deleteMany({where:{versaoModelo:version}});
  await tx.metricaModelo.deleteMany({where:{versaoModelo:version}});
  await tx.climaRegiao.deleteMany({where:{versaoDados:dataVersion}});
  const municipalityIds = [...municipalities.values()];
  const cropIds = [...crops.values()];
  const insertChunks = async <T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) => {
   for (let offset = 0; offset < rows.length; offset += 1000) await insert(rows.slice(offset, offset + 1000));
  };
  await insertChunks(artifact.climate || [], batch => tx.climaRegiao.createMany({data: batch.map(r => ({regiaoId:municipalities.get(r.code)!,temperaturaMedia:r.avgTemp??null,temperaturaMin:r.minTemp??null,chuvaMediaDiaria:r.avgDailyRain??null,chuvaAnual:r.annualRain??null,umidade:r.humidity??null,radiacaoSolar:r.solarRadiation??null,temperaturaJaneiro:r.januaryTemp??null,temperaturaJulho:r.julyTemp??null,temperaturaMinimaJulho:r.julyMinTemp??null,chuvaEstacaoSeca:r.drySeasonRain??null,chuvaVerao:r.summerRain??null,amplitudeTermica:r.thermalAmplitude??null,contrasteChuva:r.rainfallContrast??null,periodoInicio:r.periodStart??null,periodoFim:r.periodEnd??null,versaoDados:dataVersion}))}));
  const harvests = artifact.harvests || [];
  const years = [...new Set(harvests.map(row => row.year))];
  if (municipalityIds.length && cropIds.length && years.length) {
   await tx.safraRendimento.deleteMany({where:{regiaoId:{in:municipalityIds},culturaId:{in:cropIds},anoColheita:{in:years}}});
   await insertChunks(harvests, batch => tx.safraRendimento.createMany({data:batch.map(r=>({regiaoId:municipalities.get(r.code)!,culturaId:crops.get(r.crop)!,anoColheita:r.year,areaColhidaHa:r.areaHa??null,producaoT:r.productionT??null,rendimentoToneladasHectare:r.yieldTPerHa??null}))}));
  }
  await insertChunks(artifact.clusters || [], batch => tx.clusterRegiao.createMany({data:batch.map(r=>({regiaoId:municipalities.get(r.code)!,grupo:r.group,nomeGrupo:r.groupName??null,versaoModelo:version}))}));
  await insertChunks(artifact.clusterProfiles || [], batch => tx.clusterPerfil.createMany({data:batch.map(r=>({grupo:r.group,nomeGrupo:r.name??null,quantidadeMunicipios:r.municipalityCount,variaveis:r.variables as Prisma.InputJsonValue,versaoModelo:version}))}));
  await insertChunks(artifact.compatibilities || [], batch => tx.compatibilidadeCultura.createMany({data:batch.map(r=>({regiaoId:municipalities.get(r.code)!,culturaId:crops.get(r.crop)!,compatibilidade:r.score,ranking:r.rank??null,aptoReal:r.observedLabel??null,versaoModelo:version,aviso:r.notice??'Compatibilidade exploratória; não é recomendação agronômica.'}))}));
  await insertChunks(artifact.metrics || [], batch => tx.metricaModelo.createMany({data:batch.map(r=>({culturaId:crops.get(r.crop)!,algoritmo:r.algorithm,acuracia:r.accuracy??null,acuraciaBalanceada:r.balancedAccuracy??null,precisao:r.precision??null,recall:r.recall??null,f1:r.f1??null,auc:r.auc??null,baseline:r.baseline??null,matrizConfusao:r.confusionMatrix==null?Prisma.DbNull:r.confusionMatrix as Prisma.InputJsonValue,versaoModelo:version}))}));
  return {municipios:municipalities.size,culturas:crops.size,safras:artifact.harvests?.length??0,climas:artifact.climate?.length??0,clusters:artifact.clusters?.length??0,compatibilidades:artifact.compatibilities?.length??0,metricas:artifact.metrics?.length??0,versao:version};
 }, { maxWait: 10000, timeout: 120000 });
 console.log(JSON.stringify(summary,null,2));
}
main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1}).finally(()=>prisma.$disconnect());
