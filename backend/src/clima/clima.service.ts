import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClimaService {
  constructor(private readonly prisma: PrismaService) {}

  findByRegiao(regiaoId: string) {
    return this.prisma.condicaoClimatica.findMany({
      where: { regiaoId },
      orderBy: { data: 'asc' },
    });
  }
}
