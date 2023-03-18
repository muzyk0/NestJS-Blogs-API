import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { IUsersQueryRepository } from '../../infrastructure/users.query.repository.sql';
import { IUsersRepository } from '../../infrastructure/users.repository.sql';
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
  ) {}

  async execute({ login, email, password }: CreateUserCommand) {
    return this.create({ login, email, password });
  }

  async create({ login, email, password }: CreateUserDto) {
    const passwordHash = await bcrypt.hash(password, 10);

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
      await this.emailService.SendConfirmationCode({
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
