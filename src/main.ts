import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './common/filters';
import configuration from './config/configuration';

(async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
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

  await app.listen(configuration().PORT);
})();
