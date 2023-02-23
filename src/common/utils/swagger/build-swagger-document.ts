import { join } from 'path';

import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const buildSwaggerDocument = (
  app: NestExpressApplication,
  swaggerVersion: string,
) => {
  const config = new DocumentBuilder()
    .setTitle('Blog platform')
    .setDescription(
      "Sorry I'm working on new modules and don't have time to write swagger documentation. But in time it will be completely written",
    )
    .setVersion(swaggerVersion)
    .addTag('auth')
    .addTag('blogger')
    .addTag('blogs')
    .addTag('comments')
    .addTag('posts')
    .addTag('securityDevices')
    .addTag('testing')
    .addTag('superAdmin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document, {
    // customfavIcon: '../../../favicon.ico',
  });
};
