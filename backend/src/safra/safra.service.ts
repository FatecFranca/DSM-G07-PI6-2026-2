import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSafraDto, SafraQueryDto, UpdateSafraDto } from './dto/safra.dto';
import { AccessScopeService, AuthenticatedUser } from '../auth/access-scope.service';
@Injectable()
export class SafraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessScope: AccessScopeService,
  ) {}
  async findByRegiao(
    regiaoId: string,
    query: SafraQueryDto = {},
    user?: AuthenticatedUser,
  ) {
    await this.ensureRegiaoAccess(regiaoId, user);
    return this.prisma.safraRendimento.findMany({
      where: {
        regiaoId,
        ...(query.ano ? { anoColheita: query.ano } : {}),
        ...(query.cultura ? { cultura: { slug: query.cultura } } : {}),
      },
      include: { cultura: true },
      orderBy: { anoColheita: 'asc' },
    });
  }
  async create(dto: CreateSafraDto, user: AuthenticatedUser) {
    await this.accessScope.assertRegionAccess(dto.regiaoId, user);
    return this.prisma.safraRendimento.create({ data: dto });
  }
  async update(id: string, dto: UpdateSafraDto, user: AuthenticatedUser) {
    await this.accessScope.assertHarvestAccess(id, user);
    if (dto.regiaoId) await this.accessScope.assertRegionAccess(dto.regiaoId, user);
    return this.prisma.safraRendimento.update({ where: { id }, data: dto });
  }
  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.safraRendimento.delete({ where: { id } });
    return { id, deleted: true };
  }
  private async ensureExists(id: string) {
    const row = await this.prisma.safraRendimento.findUnique({
      where: { id },
      select: { id: true, regiaoId: true },
    });
    if (!row) throw new NotFoundException('Safra não encontrada');
    return row;
  }
  private async ensureRegiaoAccess(
    id: string,
    user?: { id: string; perfil: string },
  ) {
    const row = await this.prisma.regiaoProdutora.findFirst({
      where: {
        id,
        ...(user?.perfil && user.perfil !== 'ADMIN'
          ? { usuarios: { some: { id: user.id } } }
          : {}),
      },
      select: { id: true },
    });
    if (!row && user?.perfil && user.perfil !== 'ADMIN')
      throw new ForbiddenException('Município não vinculado ao usuário');
    if (!row) throw new NotFoundException('Município não encontrado');
  }
}
