import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../../users/application/users.service';
import { User } from '../../users/domain/schemas/users.schema';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
}
