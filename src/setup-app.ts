import { join } from 'path';

import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './common/filters';

export function setupApp(app: INestApplication, globalPrefix: string) {
  app.enableCors();
  app.use(cookieParser());
  app.setGlobalPrefix(globalPrefix);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (options) => {
        const errors = options.map((option) =>
          Object.values(option.constraints ?? []).map((message) => ({
            field: option.property,
            message,
          })),
        );
        return new BadRequestException(errors);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());

  return app;
}
