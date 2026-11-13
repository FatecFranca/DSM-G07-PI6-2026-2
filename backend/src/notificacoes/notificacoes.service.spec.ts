import { NotificacoesService } from './notificacoes.service';

describe('NotificacoesService', () => {
  it('creates an alert for high temperature and intense rain', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'alert-1' });
    const prisma = {
      alertaClimatico: { upsert },
      usuario: { findMany: jest.fn().mockResolvedValue([]) },
    } as never;
    const accessScope = {} as never;
    const service = new NotificacoesService(prisma, accessScope);

    const count = await service.evaluateCondition({
      regiaoId: 'region-1',
      data: new Date('2026-11-13T00:00:00.000Z'),
      temperaturaMedia: 36,
      precipitacao: 60,
    });

    expect(count).toBe(2);
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it('does not create an alert when values are within configured limits', async () => {
    const upsert = jest.fn();
    const prisma = {
      alertaClimatico: { upsert },
    } as never;
    const service = new NotificacoesService(prisma, {} as never);

    const count = await service.evaluateCondition({
      regiaoId: 'region-1',
      data: new Date('2026-11-13T00:00:00.000Z'),
      temperaturaMedia: 22,
      precipitacao: 10,
    });

    expect(count).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
  });
});
