import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegioesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(pais?: string) {
    return this.prisma.regiaoProdutora.findMany({
      where: pais ? { pais: { equals: pais, mode: 'insensitive' } } : undefined,
      orderBy: { nomeRegiao: 'asc' },
    });
  }
}
