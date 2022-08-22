import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { addDays, isAfter } from 'date-fns';
import { v4 } from 'uuid';

import { BaseAuthPayload } from '../constants';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { User } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly emailTemplateManager: EmailTemplateManager,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async decodeBaseAuth(token: string) {
    const buff = Buffer.from(token, 'base64');

    const decodedString = buff.toString('ascii');

    const loginAndPassword = decodedString.split(':');

    return {
      login: loginAndPassword[0],
      password: loginAndPassword[1],
    };
  }

  async getBaseAuthUser() {
    return BaseAuthPayload;
  }

  async login({
    login,
    password,
  }: LoginDto): Promise<{ accessToken: string } | null> {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) {
      return null;
    }

    const { password: userPassword, id: userId } = user.accountData;

    const isEqual = await this.comparePassword(password, userPassword);

    if (!isEqual) {
      return null;
    }

    const payload = { userId };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      }),
    };
  }

  async compareBaseAuth(token: string) {
    const decodedBaseData = await this.decodeBaseAuth(token);

    const baseAuthPayload = await this.getBaseAuthUser();

    if (
      decodedBaseData.login !== baseAuthPayload.login ||
      decodedBaseData.password !== baseAuthPayload.password
    ) {
      return false;
    }

    return true;
  }

  async generateHashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) {
      return null;
    }

    const { password: userPassword, id, login: userLogin } = user.accountData;

    const isEqual = await this.comparePassword(password, userPassword);

    if (!isEqual) {
      return null;
    }

    return user;
  }

  async comparePassword(password: string, userPassword: string) {
    try {
      return bcrypt.compare(password, userPassword);
    } catch {
      return false;
    }
  }

  async generateHashedPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async confirmAccount(code: string): Promise<boolean> {
    const user = await this.usersService.findOneByConfirmationCode(code);
    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const isExpired = isAfter(
      new Date(),
      user.emailConfirmation.expirationDate,
    );

    if (isExpired) {
      return false;
    }

    if (code !== user.emailConfirmation.confirmationCode) {
      return false;
    }

    return this.usersService.setIsConfirmed(user.accountData.id);
  }

  async resendConfirmationCode(email: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const updatedUser = await this.usersService.updateConfirmationCode({
      id: user.accountData.id,
      code: v4(),
      expirationDate: addDays(new Date(), 1),
    });

    if (!updatedUser) {
      return false;
    }

    const emailTemplate =
      this.emailTemplateManager.getEmailConfirmationMessage(updatedUser);

    await this.emailService.sendEmail(
      updatedUser.accountData.email,
      'Confirm your account ✔',
      emailTemplate,
    );
    return true;
  }
}
