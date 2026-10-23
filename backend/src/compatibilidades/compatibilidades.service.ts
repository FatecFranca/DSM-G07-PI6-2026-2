import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CompatibilidadeQueryDto } from './compatibilidades.dto';
import { AccessScopeService, AuthenticatedUser } from '../auth/access-scope.service';
@Injectable()
export class CompatibilidadesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessScope: AccessScopeService,
  ) {}
  async findAll(
    query: CompatibilidadeQueryDto,
    user: AuthenticatedUser,
  ) {
    const regiaoWhere: Prisma.RegiaoProdutoraWhereInput = {
      ...(query.uf ? { uf: query.uf.toUpperCase() } : {}),
      ...this.accessScope.regionWhere(user),
    };
    const where: Prisma.CompatibilidadeCulturaWhereInput = {
      compatibilidade: { gte: query.min },
      ...(query.cultura ? { cultura: { slug: query.cultura } } : {}),
      ...(Object.keys(regiaoWhere).length ? { regiao: regiaoWhere } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.compatibilidadeCultura.findMany({
        where,
        include: { regiao: true, cultura: true },
        orderBy: [
          { compatibilidade: 'desc' },
          { regiao: { nomeRegiao: 'asc' } },
        ],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.compatibilidadeCultura.count({ where }),
    ]);
    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      aviso:
        'Compatibilidade exploratória baseada em dados observacionais; não é recomendação agronômica nem previsão de produtividade.',
    };
  }
  async findByMunicipio(id: string, user: AuthenticatedUser) {
    const municipio = await this.prisma.regiaoProdutora.findFirst({
      where: {
        id,
        ...(user.perfil !== 'ADMIN'
          ? this.accessScope.regionWhere(user)
          : {}),
      },
      select: { id: true },
    });
    if (!municipio && user.perfil !== 'ADMIN')
      throw new ForbiddenException('Município não vinculado ao usuário');
    if (!municipio) throw new NotFoundException('Município não encontrado');
    return this.prisma.compatibilidadeCultura.findMany({
      where: { regiaoId: id },
      include: { cultura: true },
      orderBy: [{ ranking: 'asc' }, { compatibilidade: 'desc' }],
    });
  }
}
