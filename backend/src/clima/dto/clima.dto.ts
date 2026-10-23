import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClimaDto {
  @ApiProperty()
  @IsString()
  regiaoId: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  data: string;

  @ApiPropertyOptional({ example: 23.5 })
  @IsOptional()
  @IsNumber()
  temperaturaMedia?: number;

  @ApiPropertyOptional({ example: 120.4 })
  @IsOptional()
  @IsNumber()
  precipitacao?: number;

  @ApiPropertyOptional({ example: 68.2 })
  @IsOptional()
  @IsNumber()
  umidade?: number;

  @ApiPropertyOptional({ example: 5.7 })
  @IsOptional()
  @IsNumber()
  radiacaoSolar?: number;
}

export class UpdateClimaDto extends PartialType(CreateClimaDto) {}

export class ClimaQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  de?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  ate?: string;
}
