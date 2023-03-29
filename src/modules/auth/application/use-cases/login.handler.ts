import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { ISecurityRepository } from '../../../security/infrastructure/security.sql.repository';
import { IUsersRepository } from '../../../users/infrastructure/users.repository.sql';
import { CryptService } from '../crypt.service';
import {
  DecodedJwtRTPayload,
  JwtATPayload,
  JwtRTPayload,
} from '../interfaces/jwtPayload.type';
import { JwtService } from '../jwt.service';

export class LoginCommand {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
    public readonly userAgent: string,
    public readonly userIp: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly authService: CryptService,
    private readonly jwtService: JwtService,
    private readonly securityRepository: ISecurityRepository,
  ) {}

  async execute({ loginOrEmail, password, userAgent, userIp }: LoginCommand) {
    const user = await this.usersRepository.findOneByLoginOrEmail(loginOrEmail);

    if (!user || Boolean(user?.banned)) {
      return null;
    }

    const { password: userPassword, id, email } = user;

    const isEqual = await this.authService.comparePassword(
      password,
      userPassword,
    );

    if (!isEqual) {
      return null;
    }

    const deviceId = v4();

    const atPayload = this.createAccessTokenPayload(id, user.login, email);
    const rtPayload = this.createRefreshTokenPayload(
      id,
      user.login,
      email,
      deviceId,
    );

    const tokens = await this.jwtService.createJwtTokens(atPayload, rtPayload);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    const decodedAccessToken =
      await this.jwtService.decodeJwtToken<DecodedJwtRTPayload>(
        tokens.refreshToken,
      );

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

  private createRefreshTokenPayload(
    id: string,
    login: string,
    email: string,
    deviceId: string,
  ) {
    const rtPayload: JwtRTPayload = {
      user: {
        id,
        login,
        email,
      },
      deviceId,
    };
    return rtPayload;
  }

  private createAccessTokenPayload(id: string, login: string, email: string) {
    const atPayload: JwtATPayload = {
      user: {
        id,
        login,
        email,
      },
    };
    return atPayload;
  }
}
