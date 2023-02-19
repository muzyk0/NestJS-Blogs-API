import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { UsersRepository } from '../../../users/infrastructure/users.repository.sql';
import { AuthService } from '../auth.service';
import { JwtATPayload, JwtRTPayload } from '../interfaces/jwtPayload.type';
import { JwtService } from '../jwt.service';

export class LoginCommand {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ loginOrEmail, password }: LoginCommand) {
    const user = await this.usersRepository.findOneByLoginOrEmail(
      loginOrEmail,
      true,
    );

    if (!user /*|| Boolean(user?.banned)*/) {
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

    return this.jwtService.createJwtTokens(atPayload, rtPayload);
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
