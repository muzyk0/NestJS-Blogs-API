import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { ValidateUserCommand } from '../application/use-cases/validate-user.handler';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    const user = await this.commandBus.execute(
      new ValidateUserCommand(login, password),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
