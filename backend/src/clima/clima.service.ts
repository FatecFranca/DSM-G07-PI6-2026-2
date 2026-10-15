import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClimaDto, UpdateClimaDto } from './dto/clima.dto';

@Injectable()
export class ClimaService {
  constructor(private readonly prisma: PrismaService) {}

  findByRegiao(regiaoId: string) {
    return this.prisma.condicaoClimatica.findMany({
      where: { regiaoId },
      orderBy: { data: 'asc' },
    });
  }

  async create(dto: CreateClimaDto) {
    await this.ensureRegiao(dto.regiaoId);
    return this.prisma.condicaoClimatica.create({
      data: { ...dto, data: new Date(dto.data) },
    });
  }

  async update(id: string, dto: UpdateClimaDto) {
    await this.ensureExists(id);
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
