import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { JwtATPayload, JwtRTPayload } from './interfaces/jwtPayload.type';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly config: ConfigService,
  ) {}

  async createJwtTokens(atPayload: JwtATPayload, rtPayload: JwtRTPayload) {
    const accessToken = this.jwtService.sign(atPayload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('ACCESS_TOKEN_SECRET_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(rtPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('REFRESH_TOKEN_SECRET_EXPIRES_IN'),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async decodeJwtToken<T>(token: string): Promise<T> {
    try {
      const accessToken = this.jwtService.decode(token) as T;

      const iat = new Date(0);
      iat.setUTCSeconds(accessToken['iat']);

      const exp = new Date(0);
      exp.setUTCSeconds(accessToken['exp']);

      return {
        ...accessToken,
        iat,
        exp,
      };
    } catch {
      return null;
    }
  }
}
