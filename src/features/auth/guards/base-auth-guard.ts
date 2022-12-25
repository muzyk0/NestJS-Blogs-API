import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from '../application/auth.service';

@Injectable()
export class BaseAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }

    if (req.headers.authorization.split(' ')[0] !== 'Basic') {
      throw new UnauthorizedException();
    }

    const token = req.headers.authorization.split(' ')[1];

    const isAuth = await this.authService.compareBaseAuth(token);

    if (!isAuth) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
