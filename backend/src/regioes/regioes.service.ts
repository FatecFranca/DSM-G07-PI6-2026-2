import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRegiaoDto, RegiaoQueryDto, UpdateRegiaoDto } from './dto/regiao.dto';

@Injectable()
export class RegioesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: RegiaoQueryDto, user: { id: string; perfil: string }) {
    const where: Prisma.RegiaoProdutoraWhereInput = { codigoIbge: { not: null },
      ...(query.pais ? { pais: { equals: query.pais, mode: 'insensitive' as const } } : {}),
      ...(query.uf ? { uf: query.uf.toUpperCase() } : {}),
      ...(query.q ? { nomeRegiao: { contains: query.q, mode: 'insensitive' as const } } : {}),
      ...(query.cultura ? { compatibilidades: { some: { cultura: { slug: query.cultura } } } } : {}),
      ...(user.perfil === 'PRODUTOR' ? { usuarios: { some: { id: user.id } } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.regiaoProdutora.findMany({ where, orderBy: [{ nomeRegiao: 'asc' }, { id: 'asc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
      this.prisma.regiaoProdutora.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
  }
  async findOne(id: string, user: { id: string; perfil: string }) {
    const regiao = await this.prisma.regiaoProdutora.findUnique({ where: { id } });
    if (!regiao) throw new NotFoundException('Município não encontrado');
    await this.assertAccess(id, user);
    return regiao;
  }
  create(dto: CreateRegiaoDto) { return this.prisma.regiaoProdutora.create({ data: { ...dto, uf: dto.uf?.toUpperCase() } }); }
  async update(id: string, dto: UpdateRegiaoDto) {
    await this.ensureExists(id);
    return this.prisma.regiaoProdutora.update({ where: { id }, data: { ...dto, uf: dto.uf?.toUpperCase() } });
  }
  async remove(id: string) { await this.ensureExists(id); await this.prisma.regiaoProdutora.delete({ where: { id } }); return { id, deleted: true }; }
  async linkUser(regiaoId: string, userId: string) {
    await this.ensureExists(regiaoId);
    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    await this.prisma.regiaoProdutora.update({ where: { id: regiaoId }, data: { usuarios: { connect: { id: userId } } } });
    return { regiaoId, userId, linked: true };
  }
  async assertAccess(regiaoId: string, user: { id: string; perfil: string }) {
    if (user.perfil !== 'PRODUTOR') return;
    const linked = await this.prisma.regiaoProdutora.findFirst({ where: { id: regiaoId, usuarios: { some: { id: user.id } } }, select: { id: true } });
    if (!linked) throw new ForbiddenException('Município não vinculado ao usuário');
  }
  private async ensureExists(id: string) {
    const exists = await this.prisma.regiaoProdutora.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Município não encontrado');
  }
}
