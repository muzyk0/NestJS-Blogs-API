import { expect } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { CreateUserDto } from '../src/modules/users/application/dto/create-user.dto';

import { FakeUser, FakeUserBuilder } from './utils/fake-user.builder';
import { init } from './utils/init.test';

jest.setTimeout(120000);

describe('Auth controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  // TODO
  // describe('bad requests', () => {
  //   it('/ (GET)', () => {
  //     return request(app.getHttpServer()).get('/').expect(200);
  //     // .expect('Hello World!');
  //   });
  // });

  describe('should fake user builder work currently', () => {
    it('should user created with login and return dto model', async () => {
      const localFakeUser = await new FakeUserBuilder(app)
        .create()
        .login()
        .build();

      FakeUser.checkViewDto(localFakeUser.user);

      expect(localFakeUser.user!.login).toBe(localFakeUser.credentials!.login);
      expect(localFakeUser.accessToken).toBeDefined();

      const response = await request(app.getHttpServer())
        .get(`/auth/me`)
        .auth(localFakeUser.accessToken!, { type: 'bearer' })
        .expect(200);

      expect(response.body.login).toBe(localFakeUser.credentials!.login);
      expect(response.body.email).toBe(localFakeUser.credentials!.email);
      expect(response.body.userId).toBeDefined();
    });

    it('should user created without login', async () => {
      const localFakeUser = await new FakeUserBuilder(app).create().build();

      expect(localFakeUser.accessToken).toBeNull();
    });

    it('should user created with custom credentials', async () => {
      const credentials: CreateUserDto = {
        login: 'super-usr',
        password: 'supper-password%_',
        email: '9artru@gmail.com',
      };

      await new FakeUserBuilder(app).create(credentials).build();

      const response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: credentials.login,
          password: credentials.password,
        })
        .expect(200);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
      });
    });

    it("should user isn't login if user doesn't exists", async () => {
      const localFakeUser = await new FakeUserBuilder(app).create().build();

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: localFakeUser.credentials!.login,
          password: 'some-password',
        })
        .expect(401);

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: 'incorrect',
          password: localFakeUser.credentials!.password,
        })
        .expect(401);
    });

    // it('should bad created comment for blog post by banned user for blog', async () => {
    //   const responsePostComment = await request(app.getHttpServer())
    //     .post(`/posts/${post.id}/comments`)
    //     .auth(fakeUser2.accessToken, { type: 'bearer' })
    //     .send({
    //       content: '33333333333333333333333',
    //     })
    //     .expect(201);
    // });
  });
});
