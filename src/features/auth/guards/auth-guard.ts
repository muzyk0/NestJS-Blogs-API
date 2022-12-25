import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { AuthService } from '../application/auth.service';
import { JwtATPayload } from '../application/interfaces/jwtPayload.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      return true;
    }

    try {
      const decodedCtx = this.authService.decodeJwtToken<JwtATPayload>(token);

      request.user = decodedCtx;
    } catch (e) {
      console.error(e);
    }

    return true;
  }
}
