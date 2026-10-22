import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateSafraDto {
  @ApiProperty() @IsString() regiaoId!: string;
  @ApiProperty() @IsString() culturaId!: string;
  @ApiProperty({ example: 2024 }) @IsInt() @Min(1900) anoColheita!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) areaColhidaHa?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) producaoT?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) diasCrescimento?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) rendimentoToneladasHectare?: number;
}
export class UpdateSafraDto extends PartialType(CreateSafraDto) {}
export class SafraQueryDto {
  @ApiPropertyOptional({ example: 2024 }) @Type(() => Number) @IsOptional() @IsInt() @Min(1900) ano?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cultura?: string;
}
