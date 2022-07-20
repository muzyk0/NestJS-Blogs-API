import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { BaseAuthPayload } from '../constants';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private usersService: UsersService,
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

  async validateUser(login: string, password: string): Promise<string | null> {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) {
      return null;
    }

    const { password: userPassword, id, login: userLogin } = user.accountData;

    const isEqual = await this.comparePassword(password, userPassword);

    if (!isEqual) {
      return null;
    }

    // const token = this.createJWT({ userId: id, login: userLogin });

    const token = '';

    return token;
  }

  async comparePassword(password: string, userPassword: string) {
    try {
      return bcrypt.compare(password, userPassword);
    } catch {
      return false;
    }
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
