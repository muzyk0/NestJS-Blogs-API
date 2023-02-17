import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { UsersRepository } from '../../infrastructure/users.repository.sql';
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
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailServiceLocal,
  ) {}

  async execute({ login, email, password }: CreateUserCommand) {
    const userAlreadyExistByLogin =
      await this.usersRepository.findOneByLoginOrEmail(login);

    if (userAlreadyExistByLogin) {
      throw new BadRequestException({
        message: 'Login already exist',
        field: 'login',
      });
    }

    const userAlreadyExistByEmail = await this.usersRepository.findOneByEmail(
      email,
    );

    if (userAlreadyExistByEmail) {
      throw new BadRequestException({
        message: 'Email already exist',
        field: 'email',
      });
    }

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

    const { id, login: userLogin, email: userEmail } = createdUser;

    return {
      id,
      login: userLogin,
      email: userEmail,
      createdAt: createdUser.createdAt,
      banInfo: {
        isBanned: Boolean(createdUser.banned),
        banDate: createdUser.banned,
        banReason: createdUser.banReason,
      },
    };
  }
}
