import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './common/filters';

(async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);

  app.set('trust proxy');
  app.enableCors();
  app.use(cookieParser());

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

  await app.listen(configService.get('PORT'));
  console.log(`Application is running on: ${await app.getUrl()}`);
})();
