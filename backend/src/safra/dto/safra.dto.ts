import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSafraDto {
  @ApiProperty()
  @IsString()
  regiaoId!: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1900)
  anoColheita!: number;

  @ApiPropertyOptional({ example: 240 })
  @IsOptional()
  @IsInt()
  @Min(1)
  diasCrescimento?: number;

  @ApiPropertyOptional({ example: 1.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rendimentoToneladasHectare?: number;
}

export class UpdateSafraDto extends PartialType(CreateSafraDto) {}
