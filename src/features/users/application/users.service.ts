import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { EmailTemplateManager } from '../../email/application/email-template-manager';
import { EmailService } from '../../email/application/email.service';
import { RevokedTokenType } from '../domain/schemas/revoked-tokens.schema';
import { UserAccountDBType } from '../domain/schemas/users.schema';
import { UsersRepository } from '../infrastructure/users.repository';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateConfirmationType } from './interfaces/users.interface';

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

    const { id, login: userLogin, email: userEmail } = createdUser.accountData;

    return {
      id,
      login: userLogin,
      email: userEmail,
      createdAt: createdUser.createdAt,
    };
  }

  async findOneByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository.findOneByLoginOrEmail(loginOrEmail);
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

  async updateUserPassword(params: { password: string; id: string }) {
    return this.usersRepository.updateUserPassword(params);
  }
}
