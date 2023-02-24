import { HttpException } from '@nestjs/common/exceptions/http.exception';

export class ToManyRequestsException extends HttpException {
  constructor() {
    super({}, 429);
  }
}
