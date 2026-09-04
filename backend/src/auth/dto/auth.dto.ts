import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'produtor@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha!: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome!: string;

  @ApiPropertyOptional({ enum: PerfilUsuario, default: PerfilUsuario.PRODUTOR })
  @IsOptional()
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;
}

export class LoginDto {
  @ApiProperty({ example: 'produtor@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  senha!: string;
}
