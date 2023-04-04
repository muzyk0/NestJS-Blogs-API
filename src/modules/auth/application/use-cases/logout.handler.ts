import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISecurityRepository } from '../../../security/application/inerfaces/ISecurityRepository';
import { RevokeTokenInput } from '../dto/revoke-token.input';
import { JwtPayloadWithRt } from '../interfaces/jwt-payload-with-rt.type';
import { IRevokeTokenRepository } from '../revoke-token.abstract-class';

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
    private readonly securityRepository: ISecurityRepository,
  ) {}

  async execute({ ctx, userAgent }: LogoutCommand) {
    const revokedToken: RevokeTokenInput = {
      token: ctx.refreshToken,
      userAgent,
    };

    const isRevokedBefore =
      await this.revokeTokenRepository.checkRefreshTokenInBlackList(
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

    await this.securityRepository.remove(ctx.deviceId);
  }
}
