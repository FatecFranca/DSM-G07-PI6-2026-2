import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ClustersService {
 constructor(private readonly prisma: PrismaService) {}
 async findAll(user: { id: string; perfil: string }) {
  const where = user.perfil === 'PRODUTOR' ? { regiao: { usuarios: { some: { id: user.id } } } } : {};
  const assignments = await this.prisma.clusterRegiao.findMany({ where, include: { regiao: true }, orderBy: [{ grupo: 'asc' }, { regiao: { nomeRegiao: 'asc' } }] });
  const versions = [...new Set(assignments.map((row) => row.versaoModelo))];
  const profileKeys = assignments.map(({ grupo, versaoModelo }) => ({ grupo, versaoModelo }));
  const profiles = profileKeys.length ? await this.prisma.clusterPerfil.findMany({ where: { OR: profileKeys }, orderBy: [{ versaoModelo: 'desc' }, { grupo: 'asc' }] }) : [];
  return { versoes: versions, totalMunicipios: assignments.length, clusters: profiles.map((profile) => ({ ...profile, municipios: assignments.filter((row) => row.grupo === profile.grupo && row.versaoModelo === profile.versaoModelo).map((row) => row.regiao) })) };
 }
 async findByMunicipio(id: string, user: { id: string; perfil: string }) {
  const municipio = await this.prisma.regiaoProdutora.findFirst({ where: { id, ...(user.perfil === 'PRODUTOR' ? { usuarios: { some: { id: user.id } } } : {}) }, select: { id: true } });
  if (!municipio && user.perfil === 'PRODUTOR') throw new ForbiddenException('Município não vinculado ao usuário');
  if (!municipio) throw new NotFoundException('Município não encontrado');
  const assignments = await this.prisma.clusterRegiao.findMany({ where: { regiaoId: id }, include: { regiao: true }, orderBy: { versaoModelo: 'desc' } });
  return Promise.all(assignments.map(async (assignment) => ({ ...assignment, perfil: await this.prisma.clusterPerfil.findUnique({ where: { grupo_versaoModelo: { grupo: assignment.grupo, versaoModelo: assignment.versaoModelo } } }) })));
 }
}
