import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { addDays, isAfter } from 'date-fns';
import { v4 } from 'uuid';

import { BaseAuthPayload } from '../../constants';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service';
import { PasswordRecoveryDocument } from '../password-recovery/schemas/recovery-password.schema';
import { User } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { JwtATPayload, JwtRTPayload } from './types/jwtPayload.type';

interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly recoveryPasswordService: PasswordRecoveryService,
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

  async login({ loginOrEmail, password }: LoginDto): Promise<TokenDto | null> {
    const user = await this.usersService.findOneByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const { password: userPassword, id, email } = user.accountData;

    const isEqual = await this.comparePassword(password, userPassword);

    if (!isEqual) {
      return null;
    }

    const deviceId = v4();

    const atPayload: JwtATPayload = {
      user: {
        id,
        login: user.accountData.login,
        email,
      },
    };

    const rtPayload: JwtRTPayload = {
      user: {
        id,
        login: user.accountData.login,
        email,
      },
      deviceId,
    };

    return this.createJwtTokens(atPayload, rtPayload);
  }

  async createJwtTokens(atPayload: JwtATPayload, rtPayload: JwtRTPayload) {
    const accessToken = this.jwtService.sign(atPayload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('ACCESS_TOKEN_SECRET_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(rtPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('REFRESH_TOKEN_SECRET_EXPIRES_IN'),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async decodeJwtToken<T>(token: string): Promise<T> {
    try {
      const accessToken = this.jwtService.decode(token) as T;

      const iat = new Date(0);
      iat.setUTCSeconds(accessToken['iat']);

      const exp = new Date(0);
      exp.setUTCSeconds(accessToken['exp']);

      return {
        ...accessToken,
        iat,
        exp,
      };
    } catch {
      return null;
    }
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
    const user = await this.usersService.findOneByLoginOrEmail(login);

    if (!user) {
      return null;
    }

    const { password: userPassword } = user.accountData;

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

  async sendRecoveryPasswordTempCode(email: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return false;
    }

    const passwordRecovery: PasswordRecoveryDocument =
      await this.recoveryPasswordService.addPasswordRecovery(
        user.accountData.id,
      );

    const emailTemplate = this.emailTemplateManager.getRecoveryPasswordMessage({
      userName: user.accountData.login,
      recoveryCode: passwordRecovery.code,
    });

    await this.emailService.sendEmail(
      email,
      'Password recovery',
      emailTemplate,
    );
    return true;
  }

  async confirmPasswordRecovery({
    recoveryCode,
    userId,
    newPassword,
  }: {
    recoveryCode: string;
    userId: string;
    newPassword: string;
  }) {
    const isConfirm =
      await this.recoveryPasswordService.confirmPasswordRecovery(recoveryCode);

    if (isConfirm) {
      const password = await this.generateHashPassword(newPassword);

      await this.usersService.updateUserPassword({
        id: userId,
        password,
      });
    }
  }
}
