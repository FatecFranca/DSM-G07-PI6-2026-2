import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClimaQueryDto, CreateClimaDto, UpdateClimaDto } from './dto/clima.dto';
import { AccessScopeService, AuthenticatedUser } from '../auth/access-scope.service';

@Injectable()
export class ClimaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessScope: AccessScopeService,
  ) {}

  async findByRegiao(
    regiaoId: string,
    query: ClimaQueryDto = {},
    user?: AuthenticatedUser,
  ) {
    if (user) await this.accessScope.assertRegionAccess(regiaoId, user);
    const data = {
      ...(query.de || query.ate
        ? {
            gte: query.de ? new Date(query.de) : undefined,
            lte: query.ate ? new Date(`${query.ate}T23:59:59.999Z`) : undefined,
          }
        : {}),
    };

    return this.prisma.condicaoClimatica.findMany({
      where: { regiaoId, ...(Object.keys(data).length > 0 ? { data } : {}) },
      orderBy: { data: 'asc' },
    });
  }

  async findClimatologia(
    regiaoId: string,
    user: AuthenticatedUser,
  ) {
    await this.accessScope.assertRegionAccess(regiaoId, user);
    return this.prisma.climaRegiao.findFirst({
      where: { regiaoId },
      orderBy: { importadoEm: 'desc' },
    });
  }

  async create(dto: CreateClimaDto, user: AuthenticatedUser) {
    await this.accessScope.assertRegionAccess(dto.regiaoId, user);
    return this.prisma.condicaoClimatica.create({
      data: { ...dto, data: new Date(dto.data) },
    });
  }

  async update(id: string, dto: UpdateClimaDto, user: AuthenticatedUser) {
    await this.accessScope.assertClimateAccess(id, user);
    if (dto.regiaoId) await this.accessScope.assertRegionAccess(dto.regiaoId, user);
    const data = {
      ...dto,
      ...(dto.data ? { data: new Date(dto.data) } : {}),
    };
    return this.prisma.condicaoClimatica.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.condicaoClimatica.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.condicaoClimatica.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Condição climática não encontrada');
    }
    return exists;
  }

  private async ensureRegiao(regiaoId: string) {
    const exists = await this.prisma.regiaoProdutora.findUnique({
      where: { id: regiaoId },
    });
    if (!exists) {
      throw new NotFoundException('Região não encontrada');
    }
  }
}
