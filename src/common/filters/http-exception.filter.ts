import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorViewResultModel } from './interfaces/error-view-result.model';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    switch (status) {
      case 400:
        const message = (exception.getResponse() as any).message;
        const errors = Array.isArray(message) ? message.flat(1) : message;

        response.status(status).json(<ErrorViewResultModel>{
          errorsMessages: errors,
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
