import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RegionProfile {
  regiaoId: string;
  nomeRegiao: string;
  pais: string;
  temperaturaMedia: number;
  quantidadeObservacoes: number;
}

@Injectable()
export class ClustersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const regioes = await this.prisma.regiaoProdutora.findMany({
      include: { condicoes: { select: { temperaturaMedia: true } } },
      orderBy: { nomeRegiao: 'asc' },
    });

    const perfis: RegionProfile[] = regioes
      .map((regiao) => {
        const temperaturas = regiao.condicoes
          .map((condicao) => condicao.temperaturaMedia)
          .filter((temperatura): temperatura is number => temperatura !== null);
        if (!temperaturas.length) {
          return null;
        }
        return {
          regiaoId: regiao.id,
          nomeRegiao: regiao.nomeRegiao,
          pais: regiao.pais,
          temperaturaMedia:
            temperaturas.reduce(
              (total, temperatura) => total + temperatura,
              0,
            ) / temperaturas.length,
          quantidadeObservacoes: temperaturas.length,
        };
      })
      .filter((perfil): perfil is RegionProfile => perfil !== null);

    if (!perfis.length) {
      return {
        algoritmo: 'K-Means',
        k: 2,
        variaveis: ['temperaturaMedia'],
        clusters: [],
        totalRegioes: 0,
      };
    }

    const centroides = this.calculateCentroids(perfis);
    const clusters = centroides.map((centroide, cluster) => ({
      cluster,
      centroideTemperaturaMedia: Number(centroide.toFixed(4)),
      regioes: perfis
        .filter(
          (perfil) =>
            this.nearestCentroid(perfil.temperaturaMedia, centroides) ===
            cluster,
        )
        .map((perfil) => ({
          ...perfil,
          cluster,
        })),
    }));

    return {
      algoritmo: 'K-Means',
      k: centroides.length,
      variaveis: ['temperaturaMedia'],
      clusters,
      totalRegioes: perfis.length,
    };
  }

  private calculateCentroids(perfis: RegionProfile[]): number[] {
    const values = perfis.map((perfil) => perfil.temperaturaMedia);
    if (values.length === 1 || new Set(values).size === 1) {
      return [values[0]];
    }

    let centroids = [Math.min(...values), Math.max(...values)];
    for (let iteration = 0; iteration < 20; iteration += 1) {
      const groups = centroids.map(() => [] as number[]);
      for (const value of values) {
        groups[this.nearestCentroid(value, centroids)].push(value);
      }
      const updated = groups.map((group, index) =>
        group.length
          ? group.reduce((sum, value) => sum + value, 0) / group.length
          : centroids[index],
      );
      if (updated.every((value, index) => value === centroids[index])) {
        break;
      }
      centroids = updated;
    }
    return centroids;
  }

  private nearestCentroid(value: number, centroids: number[]): number {
    return centroids.reduce(
      (nearest, centroid, index) =>
        Math.abs(value - centroid) < Math.abs(value - centroids[nearest])
          ? index
          : nearest,
      0,
    );
  }
}
