import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser } from '../auth/access-scope.service';
import {
  DispositivoPushDto,
  NotificacaoQueryDto,
  PreferenciaNotificacaoDto,
} from './dto/notificacao.dto';
import { NotificacoesService } from './notificacoes.service';

@ApiTags('notificacoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista notificações do usuário autenticado' })
  list(@Query() query: NotificacaoQueryDto, @Req() req: NotificationRequest) {
    return this.service.list(req.user, query);
  }

  @Patch(':id/lida')
  markRead(@Param('id') id: string, @Req() req: NotificationRequest) {
    return this.service.markRead(id, req.user);
  }

  @Get('preferencias')
  listPreferences(@Req() req: NotificationRequest) {
    return this.service.listPreferences(req.user);
  }

  @Post('preferencias')
  savePreference(
    @Body() dto: PreferenciaNotificacaoDto,
    @Req() req: NotificationRequest,
  ) {
    return this.service.savePreference(dto, req.user);
  }

  @Post('dispositivos')
  registerDevice(
    @Body() dto: DispositivoPushDto,
    @Req() req: NotificationRequest,
  ) {
    return this.service.registerPushDevice(dto, req.user);
  }
}

type NotificationRequest = { user: AuthenticatedUser };
