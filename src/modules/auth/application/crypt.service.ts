import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  async comparePassword(password: string, userPassword: string) {
    try {
      return bcrypt.compare(password, userPassword);
    } catch {
      return false;
    }
  }
}
