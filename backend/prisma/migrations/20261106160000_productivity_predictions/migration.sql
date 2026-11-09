CREATE TABLE "Previsao_Produtividade" (
    "id" TEXT NOT NULL,
    "regiaoId" TEXT NOT NULL,
    "culturaId" TEXT NOT NULL,
    "anoPrevisto" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 't/ha',
    "algoritmo" TEXT NOT NULL,
    "versaoModelo" TEXT NOT NULL,
    "versaoDados" TEXT,
    "features" JSONB,
    "metricas" JSONB,
    "aviso" TEXT,
    "executadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Previsao_Produtividade_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Previsao_Produtividade_regiaoId_culturaId_anoPrevisto_versaoModelo_key"
  ON "Previsao_Produtividade"("regiaoId", "culturaId", "anoPrevisto", "versaoModelo");
CREATE INDEX "Previsao_Produtividade_regiaoId_culturaId_anoPrevisto_idx"
  ON "Previsao_Produtividade"("regiaoId", "culturaId", "anoPrevisto");
CREATE INDEX "Previsao_Produtividade_versaoModelo_idx"
  ON "Previsao_Produtividade"("versaoModelo");
ALTER TABLE "Previsao_Produtividade"
  ADD CONSTRAINT "Previsao_Produtividade_regiaoId_fkey"
  FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Previsao_Produtividade"
  ADD CONSTRAINT "Previsao_Produtividade_culturaId_fkey"
  FOREIGN KEY ("culturaId") REFERENCES "Cultura"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
