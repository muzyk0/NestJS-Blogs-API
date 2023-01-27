import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { buildSwaggerDocument } from './common/utils/swagger/build-swagger-document';
import { initStaticSwagger } from './common/utils/swagger/init-static-swagger';
import { setupApp } from './setup-app';

(async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.set('trust proxy');

  setupApp(app, configService.get('BASE_PREFIX'));

  buildSwaggerDocument(app, configService.get('APP_VERSION'));

  await app.listen(configService.get('PORT'));
  Logger.log(`Application is running on: ${await app.getUrl()}`);

  const serverUrl = configService.get('IS_DEV')
    ? `http://localhost:${configService.get('PORT')}`
    : await app.getUrl();

  if (configService.get('IS_DEV')) {
    initStaticSwagger(serverUrl);
  }
})();
