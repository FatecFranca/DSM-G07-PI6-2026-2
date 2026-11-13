import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CanalNotificacao,
  SeveridadeAlerta,
  TipoAlertaClimatica,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AccessScopeService,
  AuthenticatedUser,
} from '../auth/access-scope.service';
import {
  DispositivoPushDto,
  NotificacaoQueryDto,
  PreferenciaNotificacaoDto,
} from './dto/notificacao.dto';

const severityRank: Record<SeveridadeAlerta, number> = {
  INFO: 1,
  WARNING: 2,
  CRITICAL: 3,
};

@Injectable()
export class NotificacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessScope: AccessScopeService,
  ) {}

  async evaluateCondition(condition: {
    regiaoId: string;
    data: Date;
    temperaturaMedia?: number | null;
    temperaturaMin?: number | null;
    precipitacao?: number | null;
  }) {
    const high = Number(process.env.CLIMATE_ALERT_HIGH_TEMP_C ?? 35);
    const low = Number(process.env.CLIMATE_ALERT_LOW_TEMP_C ?? 5);
    const heavyRain = Number(process.env.CLIMATE_ALERT_HEAVY_RAIN_MM ?? 50);
    const drought = Number(process.env.CLIMATE_ALERT_DROUGHT_RAIN_MM ?? 1);
    const candidates: Array<{
      tipo: TipoAlertaClimatica;
      severidade: SeveridadeAlerta;
      value: number;
      unit: string;
      title: string;
      message: string;
    }> = [];
    const temperature = condition.temperaturaMedia ?? undefined;
    if (temperature !== undefined && temperature >= high) {
      candidates.push({
        tipo: 'TEMPERATURA_ALTA',
        severidade: 'WARNING',
        value: temperature,
        unit: '°C',
        title: 'Temperatura alta',
        message: `Temperatura média de ${temperature.toFixed(1)} °C registrada na região.`,
      });
    }
    if (temperature !== undefined && temperature <= low) {
      candidates.push({
        tipo: 'TEMPERATURA_BAIXA',
        severidade: 'WARNING',
        value: temperature,
        unit: '°C',
        title: 'Temperatura baixa',
        message: `Temperatura média de ${temperature.toFixed(1)} °C registrada na região.`,
      });
    }
    const rain = condition.precipitacao ?? undefined;
    if (rain !== undefined && rain >= heavyRain) {
      candidates.push({
        tipo: 'CHUVA_INTENSA',
        severidade: 'CRITICAL',
        value: rain,
        unit: 'mm',
        title: 'Chuva intensa',
        message: `Precipitação de ${rain.toFixed(1)} mm registrada na região.`,
      });
    } else if (rain !== undefined && rain <= drought) {
      candidates.push({
        tipo: 'ESTIAGEM',
        severidade: 'INFO',
        value: rain,
        unit: 'mm',
        title: 'Baixa precipitação',
        message: `Precipitação de ${rain.toFixed(1)} mm registrada na região.`,
      });
    }
    for (const candidate of candidates) {
      const key = `${candidate.tipo}:${condition.data.toISOString().slice(0, 10)}`;
      const alert = await this.prisma.alertaClimatico.upsert({
        where: {
          regiaoId_chaveSupressao: {
            regiaoId: condition.regiaoId,
            chaveSupressao: key,
          },
        },
        update: {},
        create: {
          regiaoId: condition.regiaoId,
          tipo: candidate.tipo,
          severidade: candidate.severidade,
          titulo: candidate.title,
          mensagem: candidate.message,
          valor: candidate.value,
          unidade: candidate.unit,
          observadoEm: condition.data,
          fonte: 'condicao-climatica',
          chaveSupressao: key,
        },
      });
      await this.createNotifications(alert.id, condition.regiaoId, candidate);
    }
    return candidates.length;
  }

  async list(user: AuthenticatedUser, query: NotificacaoQueryDto) {
    return this.prisma.notificacao.findMany({
      where: {
        usuarioId: user.id,
        ...(query.naoLidas ? { lidaEm: null } : {}),
      },
      include: {
        alerta: {
          select: {
            regiaoId: true,
            tipo: true,
            severidade: true,
            observadoEm: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 100,
    });
  }

  async markRead(id: string, user: AuthenticatedUser) {
    const notification = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId: user.id },
    });
    if (!notification)
      throw new NotFoundException('Notificação não encontrada');
    return this.prisma.notificacao.update({
      where: { id },
      data: { lidaEm: new Date(), status: 'READ' },
    });
  }

  async savePreference(
    dto: PreferenciaNotificacaoDto,
    user: AuthenticatedUser,
  ) {
    if (dto.regiaoId)
      await this.accessScope.assertRegionAccess(dto.regiaoId, user);
    const existing = await this.prisma.preferenciaNotificacao.findFirst({
      where: {
        usuarioId: user.id,
        regiaoId: dto.regiaoId ?? null,
        tipo: dto.tipo ?? null,
        canal: dto.canal,
      },
    });
    if (existing) {
      return this.prisma.preferenciaNotificacao.update({
        where: { id: existing.id },
        data: {
          habilitada: dto.habilitada,
          severidadeMinima: dto.severidadeMinima ?? 'INFO',
        },
      });
    }
    return this.prisma.preferenciaNotificacao.create({
      data: {
        usuarioId: user.id,
        ...(dto.regiaoId ? { regiaoId: dto.regiaoId } : {}),
        ...(dto.tipo ? { tipo: dto.tipo } : {}),
        canal: dto.canal,
        habilitada: dto.habilitada,
        severidadeMinima: dto.severidadeMinima ?? 'INFO',
      },
    });
  }

  listPreferences(user: AuthenticatedUser) {
    return this.prisma.preferenciaNotificacao.findMany({
      where: { usuarioId: user.id },
      orderBy: { canal: 'asc' },
    });
  }

  registerPushDevice(dto: DispositivoPushDto, user: AuthenticatedUser) {
    return this.prisma.dispositivoPush.upsert({
      where: { token: dto.token },
      update: { usuarioId: user.id, plataforma: dto.plataforma, ativo: true },
      create: {
        usuarioId: user.id,
        token: dto.token,
        plataforma: dto.plataforma,
      },
    });
  }

  private async createNotifications(
    alertId: string,
    regiaoId: string,
    candidate: {
      tipo: TipoAlertaClimatica;
      severidade: SeveridadeAlerta;
      title: string;
      message: string;
    },
  ) {
    const users = await this.prisma.usuario.findMany({
      where: { regioes: { some: { id: regiaoId } } },
      select: { id: true },
    });
    for (const user of users) {
      const preferences = await this.prisma.preferenciaNotificacao.findMany({
        where: {
          usuarioId: user.id,
          habilitada: true,
          canal: {
            in: [
              CanalNotificacao.WEB,
              CanalNotificacao.PUSH,
              CanalNotificacao.EMAIL,
            ],
          },
          OR: [{ regiaoId }, { regiaoId: null }],
          AND: [{ OR: [{ tipo: candidate.tipo }, { tipo: null }] }],
        },
      });
      for (const preference of preferences) {
        if (
          severityRank[candidate.severidade] <
          severityRank[preference.severidadeMinima]
        )
          continue;
        await this.prisma.notificacao.upsert({
          where: {
            usuarioId_alertaId_canal: {
              usuarioId: user.id,
              alertaId: alertId,
              canal: preference.canal,
            },
          },
          update: {},
          create: {
            usuarioId: user.id,
            alertaId: alertId,
            canal: preference.canal,
            titulo: candidate.title,
            mensagem: candidate.message,
            status: 'PENDING',
          },
        });
      }
    }
  }
}
