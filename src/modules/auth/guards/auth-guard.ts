import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { CryptService } from '../application/crypt.service';
import { JwtATPayload } from '../application/interfaces/jwtPayload.type';
import { JwtService } from '../application/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      return true;
    }

    try {
      const decodedCtx = this.jwtService.decodeJwtToken<JwtATPayload>(token);

      request.user = decodedCtx;
    } catch (e) {
      console.error(e);
    }

    return true;
  }
}
