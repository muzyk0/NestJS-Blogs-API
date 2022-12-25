/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { PageOptionsDto } from '../../common/paginator/page-options.dto';
import { AuthService } from '../auth/auth.service';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service';
import { RecoveryPasswordRepository } from '../password-recovery/recovery-password.repository';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from '../password-recovery/schemas/recovery-password.schema';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsRepository } from '../posts/posts.repository';
import { PostsService } from '../posts/posts.service';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { SecurityRepository } from '../security/security.repository';
import { SecurityService } from '../security/security.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogsRepository } from './blogs.repository';
import { BlogsService } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { Blog, BlogSchema } from './schemas/blogs.schema';

describe('blogsController', () => {
  let blog: BlogDto;

  let blogController: BlogsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let blogModel: Model<Blog>;
  let userModel: Model<User>;
  let postModel: Model<Post>;
  let securityModel: Model<Security>;
  let passwordRecoveryModel: Model<PasswordRecovery>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);
    passwordRecoveryModel = mongoConnection.model(
      PasswordRecovery.name,
      PasswordRecoverySchema,
    );

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      controllers: [BlogsController],
      providers: [
        BlogsService,
        BlogsRepository,
        BlogsQueryRepository,
        { provide: getModelToken(Blog.name), useValue: blogModel },
        AuthService,
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        PostsService,
        PostsRepository,
        PostsQueryRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        PasswordRecoveryService,
        RecoveryPasswordRepository,
        {
          provide: getModelToken(PasswordRecovery.name),
          useValue: passwordRecoveryModel,
        },
        JwtService,
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
      ],
    }).compile();
    blogController = app.get<BlogsController>(BlogsController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('blogController should be defined', async () => {
    expect(blogController).toBeDefined();
  });

  it('first blog should be created', async () => {
    const newBlog = await blogController.create({
      name: 'Vlad',
      description: '',
      websiteUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    blog = newBlog;

    expect(blogController).toBeDefined();
    expect(newBlog.name).toBe('Vlad');
  });

  it('blog should be defined', async () => {
    const blogInDb = await blogController.findOne(blog!.id);
    expect(blogInDb.name).toBe(blog.name);
  });

  it('two blogs should be created', async () => {
    const firstBlog = await blogController.create({
      name: 'Vlad 2',
      description: '',
      websiteUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    blog = firstBlog;

    expect(blogController).toBeDefined();
    expect(firstBlog.name).toBe('Vlad 2');
  });

  it('blogs should be equal 3 length', async () => {
    const blogs = await blogController.findAll(new PageOptionsDto());

    expect(blogs!.items.length).toBe(2);
  });

  it('blog should be removed', async () => {
    const isRemoved = await blogController.remove(blog.id);
    const blogs = await blogController.findAll(new PageOptionsDto());

    expect(isRemoved).toBeTruthy();
    expect(blogs!.items.length).toBe(1);
    expect(blogs!.items[0].name).not.toBe(blog.name);
  });

  it('blogs should be removed', async () => {
    const blogs = await blogController.findAll(new PageOptionsDto());
    const isRemoved = await blogController.remove(blogs.items[0].id);
    const blogsIsEmpty = await blogController.findAll(new PageOptionsDto());

    expect(isRemoved).toBeTruthy();
    expect(blogsIsEmpty!.items.length).toBe(0);
  });
});
