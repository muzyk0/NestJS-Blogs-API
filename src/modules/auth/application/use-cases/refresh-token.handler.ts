import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISecurityRepository } from '../../../security/application/inerfaces/ISecurityRepository';
import { JwtPayloadWithRt } from '../interfaces/jwt-payload-with-rt.type';
import { DecodedJwtRTPayload } from '../interfaces/jwtPayload.type';
import { TokensType } from '../interfaces/tokens.type';
import { JwtService } from '../jwt.service';
import { IRevokeTokenRepository } from '../revoke-token.abstract-class';

export class RefreshTokenCommand {
  constructor(
    public readonly ctx: JwtPayloadWithRt,
    public readonly userAgent?: string,
    public readonly userIp?: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly revokeTokenRepository: IRevokeTokenRepository,
    private readonly jwtService: JwtService,
    private readonly securityRepository: ISecurityRepository,
  ) {}

  async execute({
    ctx,
    userAgent,
    userIp,
  }: RefreshTokenCommand): Promise<TokensType | null> {
    const revokedToken = {
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

    const tokens = await this.jwtService.createJwtTokens(
      {
        user: ctx.user,
      },
      {
        user: ctx.user,
        deviceId: ctx.deviceId,
      },
    );

    const decodedAccessToken =
      await this.jwtService.decodeJwtToken<DecodedJwtRTPayload>(
        tokens.refreshToken,
      );

    if (!decodedAccessToken) {
      return null;
    }

    await this.securityRepository.createOrUpdate({
      userId: decodedAccessToken.user.id,
      ip: userIp,
      deviceId: decodedAccessToken.deviceId,
      deviceName: userAgent,
      issuedAt: decodedAccessToken.iat,
      expireAt: decodedAccessToken.exp,
    });

    return tokens;
  }
}
