-- CreateEnum
CREATE TYPE "TipoAlertaClimatica" AS ENUM ('TEMPERATURA_ALTA', 'TEMPERATURA_BAIXA', 'CHUVA_INTENSA', 'ESTIAGEM');

-- CreateEnum
CREATE TYPE "SeveridadeAlerta" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CanalNotificacao" AS ENUM ('WEB', 'PUSH', 'EMAIL');

-- CreateTable
CREATE TABLE "Alerta_Climatico" (
    "id" TEXT NOT NULL,
    "regiaoId" TEXT NOT NULL,
    "tipo" "TipoAlertaClimatica" NOT NULL,
    "severidade" "SeveridadeAlerta" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "unidade" TEXT,
    "observadoEm" TIMESTAMP(3) NOT NULL,
    "fonte" TEXT NOT NULL,
    "chaveSupressao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_Climatico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferencia_Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "regiaoId" TEXT,
    "tipo" "TipoAlertaClimatica",
    "canal" "CanalNotificacao" NOT NULL,
    "habilitada" BOOLEAN NOT NULL DEFAULT false,
    "severidadeMinima" "SeveridadeAlerta" NOT NULL DEFAULT 'INFO',

    CONSTRAINT "Preferencia_Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo_Push" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispositivo_Push_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "alertaId" TEXT NOT NULL,
    "canal" "CanalNotificacao" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lidaEm" TIMESTAMP(3),
    "enviadaEm" TIMESTAMP(3),
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alerta_Climatico_regiaoId_observadoEm_idx" ON "Alerta_Climatico"("regiaoId", "observadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Alerta_Climatico_regiaoId_chaveSupressao_key" ON "Alerta_Climatico"("regiaoId", "chaveSupressao");

-- CreateIndex
CREATE INDEX "Preferencia_Notificacao_usuarioId_habilitada_idx" ON "Preferencia_Notificacao"("usuarioId", "habilitada");

-- CreateIndex
CREATE UNIQUE INDEX "Preferencia_Notificacao_usuarioId_regiaoId_tipo_canal_key" ON "Preferencia_Notificacao"("usuarioId", "regiaoId", "tipo", "canal");

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_Push_token_key" ON "Dispositivo_Push"("token");

-- CreateIndex
CREATE INDEX "Dispositivo_Push_usuarioId_ativo_idx" ON "Dispositivo_Push"("usuarioId", "ativo");

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_status_criadoEm_idx" ON "Notificacao"("usuarioId", "status", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Notificacao_usuarioId_alertaId_canal_key" ON "Notificacao"("usuarioId", "alertaId", "canal");

-- AddForeignKey
ALTER TABLE "Alerta_Climatico" ADD CONSTRAINT "Alerta_Climatico_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferencia_Notificacao" ADD CONSTRAINT "Preferencia_Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo_Push" ADD CONSTRAINT "Dispositivo_Push_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_alertaId_fkey" FOREIGN KEY ("alertaId") REFERENCES "Alerta_Climatico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
