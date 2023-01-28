import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { BlogDto } from '../src/features/blogs/application/dto/blog.dto';
import { EmailService } from '../src/features/email-local/application/email.service';
import { UserViewModel } from '../src/features/users/application/dto/user.view';
import { setupApp } from '../src/setup-app';

jest.setTimeout(120000);

describe('Blogger (e2e)', () => {
  let app: INestApplication;

  // const emailService = { sendEmail: async () => undefined };

  beforeAll(async () => {
    // Create a NestJS application
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(EmailService)
      // .useValue(emailService)
      .compile();
    app = module.createNestApplication();
    //created me
    app = setupApp(app, '');

    // Connect to the in-memory server
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe(`/blogger`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`)
        .expect(204);
    });
    let user: UserViewModel;
    let user2: UserViewModel;
    let validAccessToken: { accessToken: string };
    let validAccessToken2: { accessToken: string };
    let blog: BlogDto;
    let post: BlogDto;

    it(`01 - should create new blog; status 201; content: created blog, used additional methods: POST -> /sa/users, POST -> /blogger/blogs`, async () => {
      const response00 = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'asirius',
          password: 'asirius321',
          email: 'asirius@jive.com',
        })
        .expect(201);
      user = response00.body;
      expect(user).toEqual({
        id: expect.any(String),
        login: 'asirius',
        email: 'asirius@jive.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      const response01 = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'asirius2',
          password: 'asirius321',
          email: 'asirius2@jive.com',
        })
        .expect(201);
      user2 = response01.body;
      expect(user2).toEqual({
        id: expect.any(String),
        login: 'asirius2',
        email: 'asirius2@jive.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      const responseToken = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: 'asirius', password: 'asirius321' })
        .expect(200);
      validAccessToken = responseToken.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });

      const responseToken1 = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: 'asirius2', password: 'asirius321' })
        .expect(200);
      validAccessToken2 = responseToken1.body;
      expect(validAccessToken2).toEqual({ accessToken: expect.any(String) });
      console.log('user owner post', user.id);
      console.log('user owner comment', user2.id);

      const responseBlog = await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(validAccessToken.accessToken, { type: 'bearer' })
        .send({
          name: 'Mongoose',
          description:
            'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ',
          websiteUrl: 'https://www.mongoose.com',
        })
        .expect(201);
      blog = responseBlog.body;
      expect(blog).toEqual({
        id: expect.any(String),
        name: 'Mongoose',
        description:
          'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main',
        websiteUrl: 'https://www.mongoose.com',
        createdAt: expect.any(String),
      });

      const responsePost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(validAccessToken.accessToken, { type: 'bearer' })
        .send({
          title: 'string113231423',
          shortDescription: 'fasdfdsfsd',
          content: 'strifdasdfsadfsadfng',
        })
        .expect(201);
      post = responsePost.body;

      const responseComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(validAccessToken2.accessToken, { type: 'bearer' })
        .send({
          content: '33333333333333333333333',
        })
        .expect(201);

      console.log('comment', responseComment.body);

      const responseBan = await request(app.getHttpServer())
        .put(`/sa/users/${user2.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'stringstringstringststringstringstringst',
        })
        .expect(204);

      const resBanIfo = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth('admin', 'qwerty', { type: 'basic' });

      console.log('banInfo', resBanIfo.body);
      console.log('0-0-09-0', responseComment.body.id);

      const responseComments = await request(app.getHttpServer())
        .get(`/comments/${responseComment.body.id}`)
        .expect(404);

      const responseBlogWithoutUserBan = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200);

      const responseBanForBlog1 = await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'stringstringstringstst',
        })
        .expect(204);

      const responseBlogWithoutUserBan2 = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(404);

      console.log(responseComments.body);
    });

    it('POST -> "/auth/login": Shouldn\'t login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;', async () => {
      const responseBlogWithoutUserBan2 = await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          loginOrEmail: 'asirius',
          password: 'asirius321',
        })
        .expect(401);
    });
  });
});
