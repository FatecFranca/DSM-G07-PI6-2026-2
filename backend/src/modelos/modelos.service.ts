import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ModelosService {
  constructor(private readonly prisma: PrismaService) {}
  findMetrics(cultura?: string, versao?: string) {
    return this.prisma.metricaModelo.findMany({
      where: {
        ...(cultura ? { cultura: { slug: cultura } } : {}),
        ...(versao ? { versaoModelo: versao } : {}),
      },
      include: { cultura: true },
      orderBy: [{ executadoEm: 'desc' }, { cultura: { nome: 'asc' } }],
    });
  }
}
