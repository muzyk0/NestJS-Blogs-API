import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { RevokedTokenType } from './schemas/revoked-tokens.schema';
import { UserAccountDBType } from './schemas/users.schema';
import { UpdateConfirmationType } from './users.interface';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly emailTemplateManager: EmailTemplateManager,
  ) {}

  async create({ login, email, password }: CreateUserDto) {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserAccountDBType = {
      accountData: {
        id: v4(),
        login,
        email,
        password: passwordHash,
        createdAt: new Date(),
      },
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: v4(),
        expirationDate: addDays(new Date(), 1),
        isConfirmed: false,
      },
      revokedTokens: [],
    };

    const createdUser = await this.usersRepository.create(newUser);

    if (!createdUser) {
      return null;
    }

    try {
      const emailTemplate =
        this.emailTemplateManager.getEmailConfirmationMessage(newUser);

      await this.emailService.sendEmail(
        email,
        `Thanks for registration ${createdUser.accountData.login}`,
        emailTemplate,
      );
    } catch (e) {
      console.error(e);

      await this.usersRepository.remove(createdUser.accountData.id);

      throw new Error("User isn't created");
    }

    const { id, login: userLogin } = createdUser.accountData;

    return {
      id,
      login: userLogin,
    };
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<UserDto>> {
    const users = await this.usersRepository.findAll(pageOptionsDto);
    return {
      ...users,
      items: users.items.map((u) => ({
        id: u.accountData.id,
        login: u.accountData.login,
      })),
    };
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

  async findOneByConfirmationCode(code: string) {
    return this.usersRepository.findOneByConfirmationCode(code);
  }

  async setIsConfirmed(id: string) {
    return this.usersRepository.setIsConfirmedById(id);
  }

  async updateConfirmationCode(updateConfirmation: UpdateConfirmationType) {
    return this.usersRepository.updateConfirmationCode(updateConfirmation);
  }

  async findOneById(id: string) {
    return this.usersRepository.findOneById(id);
  }

  async revokeRefreshToken(userId: string, revokeToken: RevokedTokenType) {
    return this.usersRepository.revokeRefreshToken(userId, revokeToken);
  }

  async checkRefreshToken(userId: string, revokeToken: RevokedTokenType) {
    return this.usersRepository.checkRefreshToken(userId, revokeToken);
  }
}
