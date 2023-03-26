import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { CommandHandlerNotFoundException } from '@nestjs/cqrs';
import { Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof CommandHandlerNotFoundException) {
      response
        .status(500)
        .send({ message: exception.message, stack: exception.stack });
      return;
    }

    response
      .status(418)
      .send({ message: exception.message, stack: exception.stack });
  }
}
