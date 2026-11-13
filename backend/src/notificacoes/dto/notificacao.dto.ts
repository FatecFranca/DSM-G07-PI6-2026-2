import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CanalNotificacao,
  SeveridadeAlerta,
  TipoAlertaClimatica,
} from '@prisma/client';

export class PreferenciaNotificacaoDto {
  @IsOptional()
  @IsString()
  regiaoId?: string;

  @IsOptional()
  @IsEnum(TipoAlertaClimatica)
  tipo?: TipoAlertaClimatica;

  @IsEnum(CanalNotificacao)
  canal!: CanalNotificacao;

  @IsBoolean()
  habilitada!: boolean;

  @IsOptional()
  @IsEnum(SeveridadeAlerta)
  severidadeMinima?: SeveridadeAlerta;
}

export class DispositivoPushDto {
  @IsString()
  token!: string;

  @IsString()
  plataforma!: string;
}

export class NotificacaoQueryDto {
  @IsOptional()
  @IsBoolean()
  naoLidas?: boolean;
}
