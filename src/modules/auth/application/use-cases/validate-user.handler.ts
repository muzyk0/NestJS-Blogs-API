import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRawSqlDto } from '../../../users/application/dto/user.dto';
import { IUsersRepository } from '../../../users/infrastructure/users.repository.sql';
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
    private readonly usersRepository: IUsersRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    login,
    password,
  }: ValidateUserCommand): Promise<UserRawSqlDto | null> {
    const user = await this.usersRepository.findOneByLoginOrEmail(login);

    if (!user) {
      return null;
    }

    const { password: userPassword } = user;

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
