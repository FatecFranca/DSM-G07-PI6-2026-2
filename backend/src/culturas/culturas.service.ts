import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CulturasService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.cultura.findMany({ orderBy: { nome: 'asc' } });
  }
}
