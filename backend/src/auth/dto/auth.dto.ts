import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'produtor@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome: string;
}

export class LoginDto {
  @ApiProperty({ example: 'produtor@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  senha: string;
}
