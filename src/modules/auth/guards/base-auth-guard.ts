import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { BaseAuthCommand } from '../application/use-cases/base-auth.handler';

@Injectable()
export class BaseAuthGuard implements CanActivate {
  constructor(private readonly commandBus: CommandBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }

    if (req.headers.authorization.split(' ')[0] !== 'Basic') {
      throw new UnauthorizedException();
    }

    const token = req.headers.authorization.split(' ')[1];

    const isAuth = await this.commandBus.execute(new BaseAuthCommand(token));

    if (!isAuth) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
