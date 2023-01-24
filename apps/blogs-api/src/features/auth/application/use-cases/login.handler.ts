import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { UsersService } from '../../../users/application/users.service';
import { User } from '../../../users/domain/schemas/users.schema';
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
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ loginOrEmail, password }: LoginCommand) {
    const user = await this.usersService.findOneByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const { password: userPassword, id, email } = user.accountData;

    const isEqual = await this.authService.comparePassword(
      password,
      userPassword,
    );

    if (!isEqual) {
      return null;
    }

    const deviceId = v4();

    const atPayload = this.createAccessTokenPayload(
      id,
      user.accountData.login,
      email,
    );
    const rtPayload = this.createRefreshTokenPayload(
      id,
      user.accountData.login,
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
