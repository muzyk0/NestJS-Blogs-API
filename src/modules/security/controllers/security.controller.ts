import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../shared/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContext } from '../../../shared/decorators/get-current-user.decorator';
import {
  JwtATPayload,
  JwtRTPayload,
} from '../../auth/application/interfaces/jwtPayload.type';
import { JwtRefreshAuthGuard } from '../../auth/guards/jwt-refresh-auth.guard';
import {
  RemoveAllDevicesWithoutMyDeviceCommand,
  RemoveSessionDeviceCommand,
} from '../application/use-cases';
import { ISecurityQueryRepository } from '../infrastructure/security.query.sql.repository';

@ApiTags('securityDevices')
@UseGuards(JwtRefreshAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityQueryRepository: ISecurityQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/devices')
  findAll(@GetCurrentJwtContext() ctx: JwtATPayload) {
    return this.securityQueryRepository.findAll(ctx.user.id);
  }

  @Delete('/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('deviceId') deviceId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.commandBus.execute(
      new RemoveSessionDeviceCommand(deviceId, userId),
    );
  }

  @Delete('/devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllWithoutMyDevice(@GetCurrentJwtContext() ctx: JwtRTPayload) {
    return this.commandBus.execute(
      new RemoveAllDevicesWithoutMyDeviceCommand(ctx.deviceId, ctx.user.id),
    );
  }
}
