import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AccessScopeService,
  AuthenticatedUser,
} from '../auth/access-scope.service';
import { PrismaService } from '../prisma/prisma.service';
import { PredicaoQueryDto } from './dto/predicao-query.dto';

@Injectable()
export class PredicoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessScope: AccessScopeService,
  ) {}

  async findByMunicipio(
    regiaoId: string,
    query: PredicaoQueryDto,
    user: AuthenticatedUser,
  ) {
    const region = await this.prisma.regiaoProdutora.findFirst({
      where: {
        id: regiaoId,
        ...(user.perfil === 'ADMIN' ? {} : this.accessScope.regionWhere(user)),
      },
      select: { id: true },
    });
    if (!region && user.perfil !== 'ADMIN') {
      const exists = await this.prisma.regiaoProdutora.findUnique({
        where: { id: regiaoId },
        select: { id: true },
      });
      if (exists) {
        throw new ForbiddenException('Município não vinculado ao usuário');
      }
    }
    if (!region) throw new NotFoundException('Município não encontrado');

    const where: Prisma.PrevisaoProdutividadeWhereInput = {
      regiaoId,
      ...(query.cultura ? { cultura: { slug: query.cultura } } : {}),
      ...(query.versao ? { versaoModelo: query.versao } : {}),
      ...(query.ano ? { anoPrevisto: query.ano } : {}),
    };
    const data = await this.prisma.previsaoProdutividade.findMany({
      where,
      include: { cultura: true, regiao: true },
      orderBy: [{ anoPrevisto: 'asc' }, { cultura: { nome: 'asc' } }],
    });
    if (!data.length) {
      throw new NotFoundException(
        'Nenhuma previsão de produtividade publicada para os filtros informados',
      );
    }
    return {
      municipio: data[0].regiao,
      previsoes: data.map((prediction) => ({
        id: prediction.id,
        cultura: prediction.cultura,
        ano: prediction.anoPrevisto,
        valor: prediction.valor,
        unidade: prediction.unidade,
        algoritmo: prediction.algoritmo,
        versaoModelo: prediction.versaoModelo,
        versaoDados: prediction.versaoDados,
        features: prediction.features,
        metricas: prediction.metricas,
        aviso:
          prediction.aviso ??
          'Previsão estatística exploratória; não é recomendação agronômica.',
        executadoEm: prediction.executadoEm,
      })),
    };
  }
}
