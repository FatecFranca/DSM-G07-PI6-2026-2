-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'TECNICO', 'PRODUTOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'PRODUTOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regiao_Produtora" (
    "id" TEXT NOT NULL,
    "nomeRegiao" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Regiao_Produtora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condicao_Climatica" (
    "id" TEXT NOT NULL,
    "regiaoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "temperaturaMedia" DOUBLE PRECISION,
    "precipitacao" DOUBLE PRECISION,
    "umidade" DOUBLE PRECISION,
    "radiacaoSolar" DOUBLE PRECISION,

    CONSTRAINT "Condicao_Climatica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Safra_Rendimento" (
    "id" TEXT NOT NULL,
    "regiaoId" TEXT NOT NULL,
    "anoColheita" INTEGER NOT NULL,
    "diasCrescimento" INTEGER,
    "rendimentoToneladasHectare" DOUBLE PRECISION,

    CONSTRAINT "Safra_Rendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UsuarioRegioes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UsuarioRegioes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Condicao_Climatica_regiaoId_idx" ON "Condicao_Climatica"("regiaoId");

-- CreateIndex
CREATE INDEX "Safra_Rendimento_regiaoId_idx" ON "Safra_Rendimento"("regiaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Safra_Rendimento_regiaoId_anoColheita_key" ON "Safra_Rendimento"("regiaoId", "anoColheita");

-- CreateIndex
CREATE INDEX "_UsuarioRegioes_B_index" ON "_UsuarioRegioes"("B");

-- AddForeignKey
ALTER TABLE "Condicao_Climatica" ADD CONSTRAINT "Condicao_Climatica_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Safra_Rendimento" ADD CONSTRAINT "Safra_Rendimento_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRegioes" ADD CONSTRAINT "_UsuarioRegioes_A_fkey" FOREIGN KEY ("A") REFERENCES "Regiao_Produtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRegioes" ADD CONSTRAINT "_UsuarioRegioes_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
