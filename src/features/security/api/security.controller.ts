import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContext } from '../../../common/decorators/get-current-user.decorator';
import {
  JwtATPayload,
  JwtRTPayload,
} from '../../auth/application/interfaces/jwtPayload.type';
import { JwtRefreshAuthGuard } from '../../auth/guards/jwt-refresh-auth.guard';
import { CreateSecurityDto } from '../application/dto/create-security.dto';
import { SecurityService } from '../application/security.service';
import { ISecurityQueryRepository } from '../infrastructure/security.query.sql.repository';

@ApiTags('securityDevices')
@UseGuards(JwtRefreshAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly securityQueryRepository: ISecurityQueryRepository,
  ) {}

  @Post()
  create(@Body() createSecurityDto: CreateSecurityDto) {
    return this.securityService.createOrUpdate(createSecurityDto);
  }

  @Get('/devices')
  findAll(@GetCurrentJwtContext() ctx: JwtATPayload) {
    return this.securityQueryRepository.findAll(ctx.user.id);
  }

  @Delete('/devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    const session = await this.securityService.getSessionByDeviceId(id);

    if (!session) {
      throw new NotFoundException();
    }

    if (session.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.securityService.remove(id);
  }

  @Delete('/devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllWithoutMyDevice(@GetCurrentJwtContext() ctx: JwtRTPayload) {
    return this.securityService.removeAllWithoutMyDevice(
      ctx.user.id,
      ctx.deviceId,
    );
  }
}
