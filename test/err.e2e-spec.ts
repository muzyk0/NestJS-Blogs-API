import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import {
  BlogDto,
  BlogView,
  BlogViewDtoForSuperAdmin,
} from '../src/modules/blogs/application/dto/blog.dto';
import { CommentDto } from '../src/modules/comments/application/dto/comment.dto';
import { PostViewDto } from '../src/modules/posts/application/dto/post.view.dto';
import { PostDomain } from '../src/modules/posts/domain/post.domain';
import { UserViewModel } from '../src/modules/users/infrastructure/dto/user.view';
import { PageDto } from '../src/shared/paginator/page.dto';

import { FakeUser, FakeUserBuilder } from './utils/fake-user.builder';
import { init } from './utils/init.test';

jest.setTimeout(120000);

describe('Blogger (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('super admin should ban or unban user;', () => {
    let user: UserViewModel;
    let user2: UserViewModel;
    let validAccessToken: { accessToken: string };
    let validAccessToken2: { accessToken: string };
    let blog: BlogDto;
    let blog2: BlogDto;
    let post: PostDomain;
    let post2: PostDomain;
    let responseComment: CommentDto;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`)
        .expect(204);

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
        isMembership: false,
        name: 'Mongoose',
        description:
          'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main',
        websiteUrl: 'https://www.mongoose.com',
        createdAt: expect.any(String),
      });

      const responseBlog2 = await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(validAccessToken2.accessToken, { type: 'bearer' })
        .send({
          name: 'Mongoose',
          description:
            'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ',
          websiteUrl: 'https://www.mongoose.com',
        })
        .expect(201);
      blog2 = responseBlog2.body;

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

      const responsePost2 = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .auth(validAccessToken2.accessToken, { type: 'bearer' })
        .send({
          title: 'string113231423',
          shortDescription: 'fasdfdsfsd',
          content: 'strifdasdfsadfsadfng',
        })
        .expect(201);
      post2 = responsePost2.body;

      const responseGetComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(validAccessToken2.accessToken, { type: 'bearer' })
        .send({
          content: '33333333333333333333333',
        })
        .expect(201);

      responseComment = responseGetComment.body;
    });

    describe("if user is banned logout all devices, login should return status 401, isn't show blogs, posts, comments, likes", () => {
      it('should return status 404 after get comment if owner user2', async () => {
        await request(app.getHttpServer())
          .put(`/sa/users/${user2.id}/ban`)
          .auth('admin', 'qwerty', { type: 'basic' })
          .send({
            isBanned: true,
            banReason: 'stringstringstringststringstringstringst',
          })
          .expect(204);

        // const resBanIfo = await request(app.getHttpServer())
        //   .get(`/sa/users/`)
        //   .auth('admin', 'qwerty', { type: 'basic' });

        await request(app.getHttpServer())
          .get(`/comments/${responseComment.id}`)
          .expect(404);
      });

      it('should return status 404 after get blog if owner user1', async () => {
        await request(app.getHttpServer()).get(`/blogs/${blog.id}`).expect(200);

        await request(app.getHttpServer())
          .put(`/sa/users/${user.id}/ban`)
          .auth('admin', 'qwerty', { type: 'basic' })
          .send({
            isBanned: true,
            banReason: 'stringstringstringstst',
          })
          .expect(204);

        await request(app.getHttpServer()).get(`/blogs/${blog.id}`).expect(404);
      });

      it('should return status unban user2', async () => {
        await request(app.getHttpServer())
          .put(`/sa/users/${user2.id}/ban`)
          .auth('admin', 'qwerty', { type: 'basic' })
          .send({
            isBanned: false,
            banReason: 'stringstringstringstst',
          })
          .expect(204);

        const users = await request(app.getHttpServer())
          .get(`/sa/users/`)
          .auth('admin', 'qwerty', { type: 'basic' })
          .expect(200);

        const findedUser: UserViewModel = users.body.items.find(
          (u: UserViewModel) => u.id === user2.id,
        );

        expect(findedUser.banInfo.isBanned).toBeFalsy();
        expect(findedUser.banInfo.banReason).toBeNull();

        await request(app.getHttpServer())
          .get(`/comments/${responseComment.id}`)
          .expect(200);
      });

      it('POST -> "/auth/login": Shouldn\'t login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;', async () => {
        await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'asirius',
            password: 'asirius321',
          })
          .expect(401);
      });

      it("Shouldn't show posts on banned user1", async () => {
        await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(404);
        const postsWithoutBannedUsers = await request(app.getHttpServer())
          .get(`/posts`)
          .expect(200);

        const result = postsWithoutBannedUsers.body.items.find(
          (p) => p.blogId === post.blogId,
        );

        expect(result).toBeFalsy();

        await request(app.getHttpServer())
          .get(`/posts/${post2.id}`)
          .expect(200);
      });
    });
  });

  describe('super admin should ban or unban blog;', () => {
    let fakeUser: FakeUser;
    let blog: BlogDto;
    let post: PostDomain;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`)
        .expect(204);

      fakeUser = await new FakeUserBuilder(app).create().login().build();

      expect(fakeUser.user).toEqual({
        id: expect.any(String),
        login: fakeUser.credentials.login,
        email: fakeUser.credentials.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      expect(fakeUser.accessToken).toEqual(expect.any(String));

      const responseBlog = await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(fakeUser.accessToken, { type: 'bearer' })
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
        isMembership: false,
        name: 'Mongoose',
        description:
          'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main',
        websiteUrl: 'https://www.mongoose.com',
        createdAt: expect.any(String),
      });

      const responsePost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(fakeUser.accessToken, { type: 'bearer' })
        .send({
          title: 'string113231423',
          shortDescription: 'fasdfdsfsd',
          content: 'strifdasdfsadfsadfng',
        })
        .expect(201);
      post = responsePost.body;
    });

    it('should ban blog', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: true,
        })
        .expect(204);

      const blogs = await request(app.getHttpServer())
        .get(`/sa/blogs/`)
        .auth('admin', 'qwerty')
        .expect(200);

      const currentBlog = (
        blogs.body as PageDto<BlogViewDtoForSuperAdmin>
      ).items.find((b) => b.id === blog.id);

      expect(currentBlog.banInfo.isBanned).toBeTruthy();
      expect(currentBlog.banInfo.banDate).not.toBeNull();
    });

    it('should hide posts for banned blog', async () => {
      const postsRes = await request(app.getHttpServer())
        .get(`/posts`)
        .expect(200);

      const posts = postsRes.body as PageDto<PostViewDto>;

      const currentPost = posts.items.find((b) => b.id === post.id);

      expect(posts.items).toHaveLength(0);
      expect(currentPost).toBeUndefined();
    });

    it('should hide banned blogs', async () => {
      const blogsRes = await request(app.getHttpServer())
        .get(`/blogs`)
        .expect(200);

      const blogs = blogsRes.body as PageDto<BlogView>;

      const currentPost = blogs.items.find((b) => b.id === blog.id);

      expect(blogs.items).toHaveLength(0);
      expect(currentPost).toBeUndefined();
    });

    it('should show banned blogs for super admin', async () => {
      const blogsRes = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth('admin', 'qwerty')
        .expect(200);

      const blogs = blogsRes.body as PageDto<BlogViewDtoForSuperAdmin>;

      const currentPost = blogs.items.find((b) => b.id === blog.id);

      expect(blogs.items).toHaveLength(1);
      expect(currentPost).not.toBeUndefined();
      expect(currentPost.banInfo.isBanned).toBeTruthy();
    });

    it('should unban blog', async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: false,
        })
        .expect(204);

      const blogs = await request(app.getHttpServer())
        .get(`/sa/blogs/`)
        .auth('admin', 'qwerty')
        .expect(200);

      const currentBlog = (
        blogs.body as PageDto<BlogViewDtoForSuperAdmin>
      ).items.find((b) => b.id === blog.id);

      expect(currentBlog.banInfo.isBanned).toBeFalsy();
      expect(currentBlog.banInfo.banDate).toBeNull();
    });

    it('should show posts for unbanned blog', async () => {
      const postsRes = await request(app.getHttpServer())
        .get(`/posts`)
        .expect(200);

      const posts = postsRes.body as PageDto<PostViewDto>;

      const currentPost = posts.items.find((b) => b.id === post.id);

      expect(posts.items).toHaveLength(1);
      expect(currentPost).not.toBeUndefined();
    });
  });

  describe('super admin should ban or unban blog;', () => {
    let fakeUser: FakeUser;
    let fakeUser2: FakeUser;
    let blog: BlogDto;
    let post: PostDomain;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`)
        .expect(204);

      fakeUser = await new FakeUserBuilder(app).create().login().build();
      fakeUser2 = await new FakeUserBuilder(app).create().login().build();

      expect(fakeUser.user).toEqual({
        id: expect.any(String),
        login: fakeUser.credentials.login,
        email: fakeUser.credentials.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      expect(fakeUser.accessToken).toEqual(expect.any(String));

      const responseBlog = await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(fakeUser.accessToken, { type: 'bearer' })
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
        isMembership: false,
        name: 'Mongoose',
        description:
          'A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main',
        websiteUrl: 'https://www.mongoose.com',
        createdAt: expect.any(String),
      });

      const responsePost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(fakeUser.accessToken, { type: 'bearer' })
        .send({
          title: 'string113231423',
          shortDescription: 'fasdfdsfsd',
          content: 'strifdasdfsadfsadfng',
        })
        .expect(201);
      post = responsePost.body;
    });

    it('should bad created comment for blog post by banned user for blog', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(fakeUser2.accessToken, { type: 'bearer' })
        .send({
          content: '33333333333333333333333',
        })
        .expect(201);

      const postComments = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .expect(200);

      expect(postComments.body.items).toHaveLength(1);

      await request(app.getHttpServer())
        .put(`/blogger/users/${fakeUser2.user.id}/ban`)
        .auth(fakeUser.accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'stringstringstringst',
          blogId: blog.id,
        })
        .expect(204);

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(fakeUser2.accessToken, { type: 'bearer' })
        .send({
          content: '33333333333333333333333',
        })
        .expect(403);

      const postComments2 = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .expect(200);

      expect(postComments2.body.items).toHaveLength(1);
    });
  });
});
