import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays } from 'date-fns';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/schemas/comments.schema';
import { Limit, LimitSchema } from '../limits/domain/schemas/limits.schema';
import { Post, PostSchema } from '../posts/domain/schemas/posts.schema';
import {
  Security,
  SecuritySchema,
} from '../security/domain/schemas/security.schema';
import {
  User,
  UserAccountDBType,
  UserSchema,
} from '../users/schemas/users.schema';

import { TestingRepository } from './testing.repository';
import { TestingService } from './testing.service';

describe('TestingService', () => {
  let countAll = 0;

  let testingService: TestingService;

  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let postModel: Model<Post>;
  let blogModel: Model<Blog>;
  let userModel: Model<User>;
  let commentModel: Model<Comment>;
  let limitModel: Model<Limit>;
  let securityModel: Model<Security>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    postModel = mongoConnection.model(Post.name, PostSchema);
    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    limitModel = mongoConnection.model(Limit.name, LimitSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        TestingService,
        TestingRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blog.name), useValue: blogModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(Limit.name), useValue: limitModel },
        { provide: getModelToken(Security.name), useValue: securityModel },

        {
          provide: DataSource,
          useValue: jest.fn(),
        },
      ],
    }).compile();
    testingService = app.get<TestingService>(TestingService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    countAll = 0;
    const countCreatedPosts = 10;

    const userName = 'Test User';
    const youtubeUrl = 'https://stackoverflow.com/';

    const blog = await blogModel.create({
      id: v4(),
      name: userName,
      websiteUrl: youtubeUrl,
    });

    const testPosts = new Array(countCreatedPosts).fill({
      id: 'some id',
      blogId: blog.id,
      blogName: blog.name,
      content: 'some content',
      shortDescription: 'short description',
      title: 'Some title',
    });

    expect(blog).toBeDefined();
    expect(blog.name).toBe(userName);
    expect(blog.websiteUrl).toBe(youtubeUrl);

    await postModel.insertMany(testPosts);

    const postCount = await postModel.countDocuments({});

    expect(postCount).toBe(countCreatedPosts);

    const newUser: UserAccountDBType = {
      accountData: {
        id: v4(),
        login: 'Test',
        email: 'test@9art.ru',
        password: '',
        createdAt: new Date(),
      },
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: v4(),
        expirationDate: addDays(new Date(), 1),
        isConfirmed: false,
      },
      revokedTokens: [],
    };

    await userModel.create(newUser);

    await commentModel.create({
      id: 'some id',
      postId: 'some post id',
      content: 'some content',
      createdAt: new Date(),
      userId: 'some user id',
      userLogin: 'some user login',
    });

    await limitModel.create({
      login: 'user',
      createdAt: new Date(),
      id: v4(),
      url: 'https://github.com/muzyk0/NestJS-Blogs-API',
      ip: '127.0.0.1',
    });

    expect(postCount).toBe(countCreatedPosts);

    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      countAll += await collection.countDocuments({});
    }
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('clear DB after create', async () => {
    const collections = mongoConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      countAll += await collection.countDocuments({});
    }

    const result = await testingService.clearDatabase();

    let countDocumentsAfterClearDb = 0;

    for (const key in collections) {
      const collection = collections[key];
      countDocumentsAfterClearDb += await collection.countDocuments({});
    }

    expect(result).toBeTruthy();
    expect(countDocumentsAfterClearDb).not.toBe(countAll);
    expect(countDocumentsAfterClearDb).toBe(0);
  });
});
