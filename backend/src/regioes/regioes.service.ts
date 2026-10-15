import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegiaoDto, UpdateRegiaoDto } from './dto/regiao.dto';

@Injectable()
export class RegioesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(pais?: string) {
    return this.prisma.regiaoProdutora.findMany({
      where: pais ? { pais: { equals: pais, mode: 'insensitive' } } : undefined,
      orderBy: { nomeRegiao: 'asc' },
    });
  }

  create(dto: CreateRegiaoDto) {
    return this.prisma.regiaoProdutora.create({ data: dto });
  }

  async update(id: string, dto: UpdateRegiaoDto) {
    await this.ensureExists(id);
    return this.prisma.regiaoProdutora.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.regiaoProdutora.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.regiaoProdutora.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Região não encontrada');
    }
    return exists;
  }
}
