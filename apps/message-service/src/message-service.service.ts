import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
