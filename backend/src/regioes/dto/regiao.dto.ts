import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRegiaoDto {
  @ApiProperty({ example: 'Franca' })
  @IsString()
  @MinLength(2)
  nomeRegiao: string;
  @ApiProperty({ example: 'Brasil' }) @IsString() @MinLength(2) pais: string;
  @ApiProperty({ example: '3516200' }) @Matches(/^\d{7}$/) codigoIbge: string;
  @ApiProperty({ example: 'SP' })
  @Length(2, 2)
  @Matches(/^(ES|MG|SP)$/)
  uf: string;
  @ApiPropertyOptional({ example: -20.5386 })
  @IsOptional()
  @IsNumber()
  latitude?: number;
  @ApiPropertyOptional({ example: -47.4008 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
export class UpdateRegiaoDto extends PartialType(CreateRegiaoDto) {}
export class RegiaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() pais?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() uf?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cultura?: string;
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
