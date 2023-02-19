import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    switch (status) {
      case 400:
        const exceptionMessage = exception.getResponse() as any;
        const errors = Array.isArray(exceptionMessage)
          ? exceptionMessage.flat(1)
          : exceptionMessage;

        response.status(status).json({
          errorsMessages: [errors],
        });
        break;
      case 429:
        response.sendStatus(status);
        break;
      default:
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
    }
  }
}
