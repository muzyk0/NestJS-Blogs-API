import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CryptService } from '../application/crypt.service';
import { JwtATPayload } from '../application/interfaces/jwtPayload.type';

@Injectable()
export class RtJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: CryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies['refreshToken'];
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtATPayload) {
    const refreshToken = req?.cookies['refreshToken'];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token malformed');
    }

    return { ...payload, refreshToken };
  }
}
