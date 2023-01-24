import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersService } from '../../../users/application/users.service';
import { User } from '../../../users/domain/schemas/users.schema';
import { AuthService } from '../auth.service';

export class ValidateUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserHandler
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async execute({
    login,
    password,
  }: ValidateUserCommand): Promise<User | null> {
    const user = await this.usersService.findOneByLoginOrEmail(login);

    if (!user) {
      return null;
    }

    const { password: userPassword } = user.accountData;

    const isEqual = await this.authService.comparePassword(
      password,
      userPassword,
    );

    if (!isEqual) {
      return null;
    }

    return user;
  }
}
