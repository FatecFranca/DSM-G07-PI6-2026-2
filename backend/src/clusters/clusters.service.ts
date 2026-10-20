import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RegionProfile {
  regiaoId: string;
  nomeRegiao: string;
  pais: string;
  temperaturaMedia: number;
  precipitacaoMedia: number;
  umidadeMedia: number;
  radiacaoSolarMedia: number;
  quantidadeObservacoes: number;
}

@Injectable()
export class ClustersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const regioes = await this.prisma.regiaoProdutora.findMany({
      include: {
        condicoes: {
          select: {
            temperaturaMedia: true,
            precipitacao: true,
            umidade: true,
            radiacaoSolar: true,
          },
        },
      },
      orderBy: { nomeRegiao: 'asc' },
    });

    const perfis: RegionProfile[] = regioes
      .map((regiao) => {
        const observacoes = regiao.condicoes.filter(
          (condicao) =>
            condicao.temperaturaMedia !== null &&
            condicao.precipitacao !== null &&
            condicao.umidade !== null &&
            condicao.radiacaoSolar !== null,
        );
        if (!observacoes.length) {
          return null;
        }
        return {
          regiaoId: regiao.id,
          nomeRegiao: regiao.nomeRegiao,
          pais: regiao.pais,
          temperaturaMedia: this.average(
            observacoes.map((item) => item.temperaturaMedia as number),
          ),
          precipitacaoMedia: this.average(
            observacoes.map((item) => item.precipitacao as number),
          ),
          umidadeMedia: this.average(
            observacoes.map((item) => item.umidade as number),
          ),
          radiacaoSolarMedia: this.average(
            observacoes.map((item) => item.radiacaoSolar as number),
          ),
          quantidadeObservacoes: observacoes.length,
        };
      })
      .filter((perfil): perfil is RegionProfile => perfil !== null);

    if (!perfis.length) {
      return {
        algoritmo: 'K-Means',
        k: 2,
        variaveis: [
          'temperaturaMedia',
          'precipitacaoMedia',
          'umidadeMedia',
          'radiacaoSolarMedia',
        ],
        clusters: [],
        totalRegioes: 0,
        qualidade: null,
      };
    }

    const centroides = this.calculateCentroids(perfis);
    const clusters = centroides.map((centroide, cluster) => ({
      cluster,
      centroide: this.serializeProfile(centroide),
      regioes: perfis
        .filter(
          (perfil) =>
            this.nearestCentroid(perfil, centroides) ===
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
      variaveis: [
        'temperaturaMedia',
        'precipitacaoMedia',
        'umidadeMedia',
        'radiacaoSolarMedia',
      ],
      clusters,
      totalRegioes: perfis.length,
      qualidade: {
        metrica: 'silhouette',
        valor: null,
        observacao: 'Calcule a métrica no pipeline analítico com dados processados.',
      },
    };
  }

  private calculateCentroids(perfis: RegionProfile[]): RegionProfile[] {
    if (perfis.length === 1) {
      return [perfis[0]];
    }

    let centroids = [perfis[0], perfis[perfis.length - 1]];
    for (let iteration = 0; iteration < 20; iteration += 1) {
      const groups = centroids.map(() => [] as RegionProfile[]);
      for (const perfil of perfis) {
        groups[this.nearestCentroid(perfil, centroids)].push(perfil);
      }
      const updated = groups.map((group, index) =>
        group.length
          ? this.averageProfile(group)
          : centroids[index],
      );
      if (updated.every((value, index) => this.distance(value, centroids[index]) < 0.0001)) {
        break;
      }
      centroids = updated;
    }
    return centroids;
  }

  private nearestCentroid(value: RegionProfile, centroids: RegionProfile[]): number {
    return centroids.reduce(
      (nearest, centroid, index) =>
        this.distance(value, centroid) < this.distance(value, centroids[nearest])
          ? index
          : nearest,
      0,
    );
  }

  private average(values: number[]) {
    return values.reduce((total, value) => total + value, 0) / values.length;
  }

  private averageProfile(group: RegionProfile[]): RegionProfile {
    return {
      ...group[0],
      temperaturaMedia: this.average(group.map((item) => item.temperaturaMedia)),
      precipitacaoMedia: this.average(group.map((item) => item.precipitacaoMedia)),
      umidadeMedia: this.average(group.map((item) => item.umidadeMedia)),
      radiacaoSolarMedia: this.average(group.map((item) => item.radiacaoSolarMedia)),
      quantidadeObservacoes: Math.round(
        this.average(group.map((item) => item.quantidadeObservacoes)),
      ),
    };
  }

  private distance(left: RegionProfile, right: RegionProfile) {
    return Math.sqrt(
      ((left.temperaturaMedia - right.temperaturaMedia) / 50) ** 2 +
        ((left.precipitacaoMedia - right.precipitacaoMedia) / 3000) ** 2 +
        ((left.umidadeMedia - right.umidadeMedia) / 100) ** 2 +
        ((left.radiacaoSolarMedia - right.radiacaoSolarMedia) / 30) ** 2,
    );
  }

  private serializeProfile(profile: RegionProfile) {
    return {
      temperaturaMedia: Number(profile.temperaturaMedia.toFixed(4)),
      precipitacaoMedia: Number(profile.precipitacaoMedia.toFixed(4)),
      umidadeMedia: Number(profile.umidadeMedia.toFixed(4)),
      radiacaoSolarMedia: Number(profile.radiacaoSolarMedia.toFixed(4)),
    };
  }
}
