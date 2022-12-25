import { MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { Blog, BlogSchema } from '../../blogs/domain/schemas/blogs.schema';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { EmailService } from '../../email/application/email.service';
import {
  Security,
  SecuritySchema,
} from '../../security/schemas/security.schema';
import { SecurityRepository } from '../../security/security.repository';
import { SecurityService } from '../../security/security.service';
import { Post, PostSchema } from '../domain/schemas/posts.schema';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { PostsRepository } from '../infrastructure/posts.repository';

import { PostsService } from './posts.service';

describe('PostsService', () => {
  let postsService: PostsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let postModel: Model<Post>;
  let blogModel: Model<Blog>;
  let securityModel: Model<Security>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    postModel = mongoConnection.model(Post.name, PostSchema);
    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        PostsRepository,
        PostsQueryRepository,
        BlogsRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blog.name), useValue: blogModel },
        EmailService,
        { provide: MailerService, useValue: jest.fn() },
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
      ],
    }).compile();
    postsService = app.get<PostsService>(PostsService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('postsService should be defined', async () => {
    expect(postsService).toBeDefined();
  });
});
