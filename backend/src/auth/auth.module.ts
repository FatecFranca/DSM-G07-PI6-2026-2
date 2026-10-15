import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET ||
        (() => {
          throw new Error('JWT_SECRET não configurado');
        })(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
