import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { setupApp } from '../../src/setup-app';

export const init = async (): Promise<INestApplication> => {
  let app: INestApplication;

  // Create a NestJS application
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // .overrideProvider(EmailService)
    // .useValue(emailService)
    .compile();
  app = moduleFixture.createNestApplication();
  //created me
  app = setupApp(app, '');

  await app.init();

  return app;
};
