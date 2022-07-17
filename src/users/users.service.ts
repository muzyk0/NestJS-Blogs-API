import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { UserAccountDBType } from './schemas/users.schema';
import { v4 } from 'uuid';
import { addDays } from 'date-fns';
import { UserDto } from './dto/user.dto';

interface IUsersService {
  create(createUserDto: CreateUserDto): Promise<any>;
}

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create({ login, email }: CreateUserDto) {
    // const passwordHash = await this.authService.generateHashPassword(
    //   password
    // );

    const newUser: UserAccountDBType = {
      accountData: {
        id: v4(),
        login,
        email,
        password: '', //passwordHash,
        createdAt: new Date(),
      },
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: v4(),
        expirationDate: addDays(new Date(), 1),
        isConfirmed: false,
      },
    };

    const createdUser = await this.usersRepository.create(newUser);

    if (!createdUser) {
      return null;
    }

    try {
      // const emailTemplate =
      //   emailTemplateManager.getEmailConfirmationMessage(newUser);
      //
      // await this.emailService.sendEmail(
      //   email,
      //   `Thanks for registration ${createdUser.accountData.login}`,
      //   emailTemplate,
      // );
    } catch (e) {
      console.error(e);
    }

    const { id, login: userLogin } = createdUser.accountData;

    return {
      id,
      login: userLogin,
    };
  }

  async findAll(searchNameTerm?: string): Promise<UserDto[]> {
    const users = await this.usersRepository.findAll({ searchNameTerm });
    return users.map((u) => ({
      id: u.accountData.id,
      login: u.accountData.login,
    }));
  }

  async findOneByLogin(login: string) {
    return this.usersRepository.findOneByLogin(login);
  }

  async findOneByEmail(email: string) {
    return this.usersRepository.findOneByEmail(email);
  }

  async remove(id: string) {
    return this.usersRepository.remove(id);
  }
}
