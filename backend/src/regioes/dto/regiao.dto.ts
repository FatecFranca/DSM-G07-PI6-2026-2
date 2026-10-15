import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRegiaoDto {
  @ApiProperty({ example: 'Franca' })
  @IsString()
  @MinLength(2)
  nomeRegiao: string;

  @ApiProperty({ example: 'Brasil' })
  @IsString()
  @MinLength(2)
  pais: string;

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
