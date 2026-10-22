import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSafraDto, SafraQueryDto, UpdateSafraDto } from './dto/safra.dto';
@Injectable()
export class SafraService {
  constructor(private readonly prisma: PrismaService) {}
  async findByRegiao(regiaoId: string, query: SafraQueryDto = {}, user?: { id: string; perfil: string }) {
    await this.ensureRegiaoAccess(regiaoId, user);
    return this.prisma.safraRendimento.findMany({
      where: { regiaoId, ...(query.ano ? { anoColheita: query.ano } : {}), ...(query.cultura ? { cultura: { slug: query.cultura } } : {}) },
      include: { cultura: true }, orderBy: { anoColheita: 'asc' },
    });
  }
  async create(dto: CreateSafraDto) {
    await this.ensureRegiao(dto.regiaoId);
    return this.prisma.safraRendimento.create({ data: dto });
  }
  async update(id: string, dto: UpdateSafraDto) {
    await this.ensureExists(id); if (dto.regiaoId) await this.ensureRegiao(dto.regiaoId);
    return this.prisma.safraRendimento.update({ where: { id }, data: dto });
  }
  async remove(id: string) { await this.ensureExists(id); await this.prisma.safraRendimento.delete({ where: { id } }); return { id, deleted: true }; }
  private async ensureExists(id: string) {
    const row = await this.prisma.safraRendimento.findUnique({ where: { id }, select: { id: true, regiaoId: true } });
    if (!row) throw new NotFoundException('Safra não encontrada'); return row;
  }
  private async ensureRegiao(id: string) {
    const row = await this.prisma.regiaoProdutora.findUnique({ where: { id }, select: { id: true } });
    if (!row) throw new NotFoundException('Município não encontrado');
  }
  private async ensureRegiaoAccess(id: string, user?: { id: string; perfil: string }) {
    const row = await this.prisma.regiaoProdutora.findFirst({ where: { id, ...(user?.perfil === 'PRODUTOR' ? { usuarios: { some: { id: user.id } } } : {}) }, select: { id: true } });
    if (!row && user?.perfil === 'PRODUTOR') throw new ForbiddenException('Município não vinculado ao usuário');
    if (!row) throw new NotFoundException('Município não encontrado');
  }
}
