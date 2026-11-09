import { NotFoundException } from '@nestjs/common';
import { PredicoesService } from './predicoes.service';

describe('PredicoesService', () => {
  const prisma = {
    regiaoProdutora: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    previsaoProdutividade: {
      findMany: jest.fn(),
    },
  };
  const accessScope = {
    regionWhere: jest.fn((user: { id: string }) => ({
      usuarios: { some: { id: user.id } },
    })),
  };

  beforeEach(() => jest.clearAllMocks());

  it('retorna previsões persistidas com filtros', async () => {
    const service = new PredicoesService(prisma as never, accessScope as never);
    prisma.regiaoProdutora.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 'municipio-1' });
    prisma.previsaoProdutividade.findMany = jest.fn().mockResolvedValue([
      {
        id: 'prediction-1',
        anoPrevisto: 2027,
        valor: 2.4,
        unidade: 't/ha',
        algoritmo: 'Regressão linear',
        versaoModelo: 'modelo-1',
        versaoDados: 'dados-1',
        features: { temperatura: 22 },
        metricas: { r2: 0.1 },
        aviso: null,
        executadoEm: new Date('2026-11-06'),
        cultura: { slug: 'cafe', nome: 'Café' },
        regiao: { id: 'municipio-1', nomeRegiao: 'Franca' },
      },
    ]);

    await expect(
      service.findByMunicipio(
        'municipio-1',
        { cultura: 'cafe', versao: 'modelo-1', ano: 2027 },
        { id: 'user-1', perfil: 'PRODUTOR' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        previsoes: [expect.objectContaining({ valor: 2.4 })],
      }),
    );

    expect(prisma.previsaoProdutividade.findMany).toHaveBeenCalledTimes(1);
  });

  it('retorna 404 quando não há previsão publicada', async () => {
    const service = new PredicoesService(prisma as never, accessScope as never);
    prisma.regiaoProdutora.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 'municipio-1' });
    prisma.previsaoProdutividade.findMany = jest.fn().mockResolvedValue([]);

    await expect(
      service.findByMunicipio(
        'municipio-1',
        {},
        { id: 'user-1', perfil: 'PRODUTOR' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
