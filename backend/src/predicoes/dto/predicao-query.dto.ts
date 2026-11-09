import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PredicaoQueryDto {
  @ApiPropertyOptional({ description: 'Slug da cultura, por exemplo cafe' })
  @IsOptional()
  @IsString()
  cultura?: string;

  @ApiPropertyOptional({ description: 'Versão do modelo publicada' })
  @IsOptional()
  @IsString()
  versao?: string;

  @ApiPropertyOptional({ minimum: 1900 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1900)
  ano?: number;
}
