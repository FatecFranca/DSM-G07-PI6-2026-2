import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SafraService {
  constructor(private readonly prisma: PrismaService) {}

  findByRegiao(regiaoId: string) {
    return this.prisma.safraRendimento.findMany({
      where: { regiaoId },
      orderBy: { anoColheita: 'asc' },
    });
  }
}
