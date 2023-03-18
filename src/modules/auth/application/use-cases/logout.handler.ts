import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityService } from '../../../security/application/security.service';
import { RevokeTokenInput } from '../../infrastructure/dto/revoke-token.input';
import { IRevokeTokenRepository } from '../../infrastructure/revoke-token.repository.sql';
import { JwtPayloadWithRt } from '../interfaces/jwt-payload-with-rt.type';

export class LogoutCommand {
  constructor(
    public readonly ctx: JwtPayloadWithRt,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly revokeTokenRepository: IRevokeTokenRepository,
    private readonly securityService: SecurityService,
  ) {}

  async execute({ ctx, userAgent }: LogoutCommand) {
    const revokedToken: RevokeTokenInput = {
      token: ctx.refreshToken,
      userAgent,
    };

    const isRevokedBefore = await this.revokeTokenRepository.checkRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (isRevokedBefore) {
      throw new UnauthorizedException();
    }

    const isRevoked = await this.revokeTokenRepository.revokeRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (!isRevoked) {
      throw new ForbiddenException({
        message: "User isn't existing",
        field: '',
      });
    }

    await this.securityService.remove(ctx.deviceId);
  }
}
