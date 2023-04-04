import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IUsersRepository } from '../../../users/application/application/users-repository.abstract-class';
import { UserRawSqlDto } from '../../../users/application/dto/user.dto';
import { User } from '../../../users/domain/entities/user.entity';
import { CryptService } from '../crypt.service';

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
    private readonly authService: CryptService,
  ) {}

  async execute({
    login,
    password,
  }: ValidateUserCommand): Promise<User | null> {
    const user = await this.usersRepository.findOneByLoginOrEmailWithoutBanned(
      login,
    );

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
