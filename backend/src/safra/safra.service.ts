import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSafraDto,
  SafraQueryDto,
  UpdateSafraDto,
} from './dto/safra.dto';

@Injectable()
export class SafraService {
  constructor(private readonly prisma: PrismaService) {}

  findByRegiao(regiaoId: string, query: SafraQueryDto = {}) {
    return this.prisma.safraRendimento.findMany({
      where: { regiaoId, ...(query.ano ? { anoColheita: query.ano } : {}) },
      orderBy: { anoColheita: 'asc' },
    });
  }

  async create(dto: CreateSafraDto) {
    await this.ensureRegiao(dto.regiaoId);
    return this.prisma.safraRendimento.create({ data: dto });
  }

  async update(id: string, dto: UpdateSafraDto) {
    await this.ensureExists(id);
    if (dto.regiaoId) {
      await this.ensureRegiao(dto.regiaoId);
    }
    return this.prisma.safraRendimento.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.safraRendimento.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.safraRendimento.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Safra não encontrada');
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
