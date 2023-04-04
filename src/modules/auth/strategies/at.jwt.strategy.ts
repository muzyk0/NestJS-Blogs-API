import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtATPayload } from '../application/interfaces/jwtPayload.type';

@Injectable()
export class AtJwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtATPayload) {
    return payload;
  }
}
