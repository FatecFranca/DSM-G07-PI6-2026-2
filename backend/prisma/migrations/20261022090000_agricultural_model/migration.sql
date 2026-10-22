BEGIN;

ALTER TABLE "Regiao_Produtora" ADD COLUMN "codigoIbge" TEXT, ADD COLUMN "uf" TEXT;
CREATE UNIQUE INDEX "Regiao_Produtora_codigoIbge_key" ON "Regiao_Produtora"("codigoIbge");
CREATE INDEX "Regiao_Produtora_uf_idx" ON "Regiao_Produtora"("uf");

CREATE TABLE "Cultura" ("id" TEXT NOT NULL, "nome" TEXT NOT NULL, "slug" TEXT NOT NULL, CONSTRAINT "Cultura_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Cultura_nome_key" ON "Cultura"("nome");
CREATE UNIQUE INDEX "Cultura_slug_key" ON "Cultura"("slug");

ALTER TABLE "Safra_Rendimento" ADD COLUMN "culturaId" TEXT, ADD COLUMN "areaColhidaHa" DOUBLE PRECISION, ADD COLUMN "producaoT" DOUBLE PRECISION;
INSERT INTO "Cultura" ("id", "nome", "slug") VALUES ('legacy-coffee', 'Café', 'cafe') ON CONFLICT ("slug") DO NOTHING;
UPDATE "Safra_Rendimento" SET "culturaId" = (SELECT "id" FROM "Cultura" WHERE "slug" = 'cafe') WHERE "culturaId" IS NULL;
ALTER TABLE "Safra_Rendimento" ALTER COLUMN "culturaId" SET NOT NULL;
DROP INDEX "Safra_Rendimento_regiaoId_anoColheita_key";
DROP INDEX "Safra_Rendimento_regiaoId_idx";
CREATE UNIQUE INDEX "Safra_Rendimento_regiaoId_culturaId_anoColheita_key" ON "Safra_Rendimento"("regiaoId", "culturaId", "anoColheita");
CREATE INDEX "Safra_Rendimento_regiaoId_culturaId_idx" ON "Safra_Rendimento"("regiaoId", "culturaId");
ALTER TABLE "Safra_Rendimento" ADD CONSTRAINT "Safra_Rendimento_culturaId_fkey" FOREIGN KEY ("culturaId") REFERENCES "Cultura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Clima_Regiao" ("id" TEXT NOT NULL, "regiaoId" TEXT NOT NULL, "temperaturaMedia" DOUBLE PRECISION, "temperaturaMin" DOUBLE PRECISION, "chuvaMediaDiaria" DOUBLE PRECISION, "chuvaAnual" DOUBLE PRECISION, "umidade" DOUBLE PRECISION, "radiacaoSolar" DOUBLE PRECISION, "temperaturaJaneiro" DOUBLE PRECISION, "temperaturaJulho" DOUBLE PRECISION, "temperaturaMinimaJulho" DOUBLE PRECISION, "chuvaEstacaoSeca" DOUBLE PRECISION, "chuvaVerao" DOUBLE PRECISION, "amplitudeTermica" DOUBLE PRECISION, "contrasteChuva" DOUBLE PRECISION, "periodoInicio" INTEGER, "periodoFim" INTEGER, "versaoDados" TEXT, "importadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Clima_Regiao_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Clima_Regiao_regiaoId_versaoDados_key" ON "Clima_Regiao"("regiaoId", "versaoDados");
CREATE INDEX "Clima_Regiao_regiaoId_versaoDados_idx" ON "Clima_Regiao"("regiaoId", "versaoDados");
ALTER TABLE "Clima_Regiao" ADD CONSTRAINT "Clima_Regiao_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Cluster_Regiao" ("id" TEXT NOT NULL, "regiaoId" TEXT NOT NULL, "grupo" INTEGER NOT NULL, "nomeGrupo" TEXT, "versaoModelo" TEXT NOT NULL, CONSTRAINT "Cluster_Regiao_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Cluster_Regiao_regiaoId_versaoModelo_key" ON "Cluster_Regiao"("regiaoId", "versaoModelo");
CREATE INDEX "Cluster_Regiao_versaoModelo_grupo_idx" ON "Cluster_Regiao"("versaoModelo", "grupo");
ALTER TABLE "Cluster_Regiao" ADD CONSTRAINT "Cluster_Regiao_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Cluster_Perfil" ("id" TEXT NOT NULL, "grupo" INTEGER NOT NULL, "nomeGrupo" TEXT, "quantidadeMunicipios" INTEGER NOT NULL, "variaveis" JSONB NOT NULL, "versaoModelo" TEXT NOT NULL, CONSTRAINT "Cluster_Perfil_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Cluster_Perfil_grupo_versaoModelo_key" ON "Cluster_Perfil"("grupo", "versaoModelo");

CREATE TABLE "Compatibilidade_Cultura" ("id" TEXT NOT NULL, "regiaoId" TEXT NOT NULL, "culturaId" TEXT NOT NULL, "compatibilidade" DOUBLE PRECISION NOT NULL, "ranking" INTEGER, "aptoReal" BOOLEAN, "versaoModelo" TEXT NOT NULL, "aviso" TEXT, CONSTRAINT "Compatibilidade_Cultura_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Compatibilidade_Cultura_regiaoId_culturaId_versaoModelo_key" ON "Compatibilidade_Cultura"("regiaoId", "culturaId", "versaoModelo");
CREATE INDEX "Compatibilidade_Cultura_culturaId_compatibilidade_idx" ON "Compatibilidade_Cultura"("culturaId", "compatibilidade");
ALTER TABLE "Compatibilidade_Cultura" ADD CONSTRAINT "Compatibilidade_Cultura_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Compatibilidade_Cultura" ADD CONSTRAINT "Compatibilidade_Cultura_culturaId_fkey" FOREIGN KEY ("culturaId") REFERENCES "Cultura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Metrica_Modelo" ("id" TEXT NOT NULL, "culturaId" TEXT NOT NULL, "algoritmo" TEXT NOT NULL, "acuracia" DOUBLE PRECISION, "acuraciaBalanceada" DOUBLE PRECISION, "precisao" DOUBLE PRECISION, "recall" DOUBLE PRECISION, "f1" DOUBLE PRECISION, "auc" DOUBLE PRECISION, "baseline" DOUBLE PRECISION, "matrizConfusao" JSONB, "versaoModelo" TEXT NOT NULL, "executadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Metrica_Modelo_pkey" PRIMARY KEY ("id"));
CREATE INDEX "Metrica_Modelo_culturaId_versaoModelo_idx" ON "Metrica_Modelo"("culturaId", "versaoModelo");
ALTER TABLE "Metrica_Modelo" ADD CONSTRAINT "Metrica_Modelo_culturaId_fkey" FOREIGN KEY ("culturaId") REFERENCES "Cultura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
