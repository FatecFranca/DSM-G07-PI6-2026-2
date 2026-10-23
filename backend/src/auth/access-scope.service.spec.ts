import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessScopeService } from './access-scope.service';

describe('AccessScopeService', () => {
  const prisma = {
    regiaoProdutora: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    condicaoClimatica: {
      findUnique: jest.fn(),
    },
    safraRendimento: {
      findUnique: jest.fn(),
    },
  } as any;

  let service: AccessScopeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccessScopeService(prisma);
  });

  it('deixa ADMIN sem filtro de região', () => {
    expect(service.regionWhere({ id: 'admin', perfil: 'ADMIN' })).toEqual({});
  });

  it('restringe TECNICO e PRODUTOR às regiões vinculadas', () => {
    expect(service.regionWhere({ id: 'user-1', perfil: 'TECNICO' })).toEqual({
      usuarios: { some: { id: 'user-1' } },
    });
    expect(service.regionWhere({ id: 'user-2', perfil: 'PRODUTOR' })).toEqual({
      usuarios: { some: { id: 'user-2' } },
    });
  });

  it('permite acesso à região vinculada', async () => {
    prisma.regiaoProdutora.findUnique.mockResolvedValue({ id: 'regiao-1' });
    prisma.regiaoProdutora.findFirst.mockResolvedValue({ id: 'regiao-1' });

    await expect(
      service.assertRegionAccess('regiao-1', {
        id: 'tecnico-1',
        perfil: 'TECNICO',
      }),
    ).resolves.toBeUndefined();
  });

  it('bloqueia região existente que não está vinculada', async () => {
    prisma.regiaoProdutora.findUnique.mockResolvedValue({ id: 'regiao-1' });
    prisma.regiaoProdutora.findFirst.mockResolvedValue(null);

    await expect(
      service.assertRegionAccess('regiao-1', {
        id: 'tecnico-1',
        perfil: 'TECNICO',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('retorna 404 para região inexistente', async () => {
    prisma.regiaoProdutora.findUnique.mockResolvedValue(null);

    await expect(
      service.assertRegionAccess('missing', {
        id: 'admin-1',
        perfil: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
