import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { CryptService } from '../../../auth/application/crypt.service';
import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { IUsersQueryRepository } from '../../controllers/interfaces/users-query-repository.abstract-class';
import { IUsersRepository } from '../application/users-repository.abstract-class';
import { CreateUserDto } from '../dto/create-user.dto';

export class CreateUserCommand {
  constructor(
    public readonly login: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly usersQueryRepository: IUsersQueryRepository,
    private readonly emailService: EmailServiceLocal,
    private readonly cryptService: CryptService,
  ) {}

  async execute({ login, email, password }: CreateUserCommand) {
    return this.create({ login, email, password });
  }

  async create({ login, email, password }: CreateUserDto) {
    const passwordHash = await this.cryptService.hashPassword(password);

    const createdUser = await this.usersRepository.create({
      login,
      email,
      password: passwordHash,
      confirmationCode: v4(),
      expirationDate: addDays(new Date(), 1),
      isConfirmed: false,
    });

    if (!createdUser) {
      return null;
    }

    try {
      await this.emailService.sendConfirmationCode({
        email,
        userName: createdUser.login,
        confirmationCode: createdUser.confirmationCode,
      });
    } catch (e) {
      console.error(e);

      await this.usersRepository.remove(createdUser.id);

      throw new Error("User isn't created");
    }

    const { id } = createdUser;

    return this.usersQueryRepository.findOne(id);
  }
}
