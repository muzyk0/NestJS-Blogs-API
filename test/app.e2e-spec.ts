import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { init } from './utils/init.test';

jest.setTimeout(120000);

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200);
    // .expect('Hello World!');
  });
});
