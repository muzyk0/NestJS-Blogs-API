import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './common/filters';
import { buildSwaggerDocument } from './common/utils/swagger/build-swagger-document';
import { initStaticSwagger } from './common/utils/swagger/init-static-swagger';

(async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.set('trust proxy');
  app.enableCors();
  app.use(cookieParser());
  app.setGlobalPrefix(configService.get('BASE_PREFIX'));

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

  buildSwaggerDocument(app, configService.get('APP_VERSION'));

  await app.listen(configService.get('PORT'));
  Logger.log(`Application is running on: ${await app.getUrl()}`);

  const serverUrl = configService.get('IS_DEV')
    ? `http://localhost:${configService.get('PORT')}`
    : await app.getUrl();

  initStaticSwagger(serverUrl);
})();
