import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedUser = { id: string; perfil: string };

@Injectable()
export class AccessScopeService {
  constructor(private readonly prisma: PrismaService) {}

  regionWhere(user: AuthenticatedUser): Prisma.RegiaoProdutoraWhereInput {
    return user.perfil === 'ADMIN'
      ? {}
      : { usuarios: { some: { id: user.id } } };
  }

  async assertRegionAccess(regiaoId: string, user: AuthenticatedUser) {
    const region = await this.prisma.regiaoProdutora.findUnique({
      where: { id: regiaoId },
      select: { id: true },
    });
    if (!region) throw new NotFoundException('Município não encontrado');
    if (user.perfil === 'ADMIN') return;

    const linked = await this.prisma.regiaoProdutora.findFirst({
      where: { id: regiaoId, ...this.regionWhere(user) },
      select: { id: true },
    });
    if (!linked) throw new ForbiddenException('Município não vinculado ao usuário');
  }

  async assertClimateAccess(climaId: string, user: AuthenticatedUser) {
    const climate = await this.prisma.condicaoClimatica.findUnique({
      where: { id: climaId },
      select: { regiaoId: true },
    });
    if (!climate) throw new NotFoundException('Condição climática não encontrada');
    await this.assertRegionAccess(climate.regiaoId, user);
  }

  async assertHarvestAccess(safraId: string, user: AuthenticatedUser) {
    const harvest = await this.prisma.safraRendimento.findUnique({
      where: { id: safraId },
      select: { regiaoId: true },
    });
    if (!harvest) throw new NotFoundException('Safra não encontrada');
    await this.assertRegionAccess(harvest.regiaoId, user);
  }
}
