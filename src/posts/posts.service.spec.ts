import { MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/schemas/blogs.schema';
import { EmailService } from '../email/email.service';

import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';

describe('PostsService', () => {
  let postsService: PostsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let postModel: Model<Post>;
  let blogModel: Model<Blog>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    postModel = mongoConnection.model(Post.name, PostSchema);
    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        PostsRepository,
        BlogsRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blog.name), useValue: blogModel },
        EmailService,
        { provide: MailerService, useValue: jest.fn() },
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
