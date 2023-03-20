import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/modules/email-local/application/email.service';
import { setupApp } from '../../src/setup-app';
import { MockEmailService } from '../mock/mock-email-service';

export const init = async (): Promise<INestApplication> => {
  let app: INestApplication;

  // Create a NestJS application
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(MockEmailService)
    .compile();
  app = moduleFixture.createNestApplication();
  //created me
  app = setupApp(app, '');

  await app.init();

  return app;
};
