import { join } from 'path';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { buildSwaggerDocument } from './common/utils/swagger/build-swagger-document';
import { initStaticSwagger } from './common/utils/swagger/init-static-swagger';
import { ConfigurationType } from './config/configuration';
import { setupApp } from './setup-app';

(async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService<ConfigurationType> =
    app.get(ConfigService);

  app.set('trust proxy');
  app.useStaticAssets(join(__dirname, 'assets'));

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  setupApp(app, configService.get<string>('BASE_PREFIX', { infer: true })!);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  buildSwaggerDocument(app, configService.get('APP_VERSION', { infer: true })!);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await app.listen(configService.get('PORT', { infer: true })!);
  Logger.log(`Application is running on: ${await app.getUrl()}`);

  const serverUrl = configService.get('IS_DEV')
    ? `http://localhost:${configService.get('PORT')}`
    : await app.getUrl();

  if (configService.get('IS_DEV')) {
    initStaticSwagger(serverUrl);
  }
})();
