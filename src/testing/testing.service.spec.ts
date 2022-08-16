import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays } from 'date-fns';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { v4 } from 'uuid';

import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
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
  let bloggerModel: Model<Blogger>;
  let userModel: Model<User>;
  let commentModel: Model<Comment>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    postModel = mongoConnection.model(Post.name, PostSchema);
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        TestingService,
        TestingRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
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

    const blogger = await bloggerModel.create({
      id: v4(),
      name: userName,
      youtubeUrl,
    });

    const testPosts = new Array(countCreatedPosts).fill({
      id: 'some id',
      bloggerId: blogger.id,
      bloggerName: blogger.name,
      content: 'some content',
      shortDescription: 'short description',
      title: 'Some title',
    });

    expect(blogger).toBeDefined();
    expect(blogger.name).toBe(userName);
    expect(blogger.youtubeUrl).toBe(youtubeUrl);

    await postModel.insertMany(testPosts);

    const postCount = await postModel.countDocuments({});

    expect(postCount).toBe(countCreatedPosts);

    const newUser: UserAccountDBType = {
      accountData: {
        id: v4(),
        login: 'Test',
        email: 'test@9art.ru',
        password: '', //passwordHash,
        createdAt: new Date(),
      },
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: v4(),
        expirationDate: addDays(new Date(), 1),
        isConfirmed: false,
      },
    };

    await userModel.create(newUser);

    await commentModel.create({
      id: 'some id',
      postId: 'some post id',
      content: 'some content',
      addedAt: new Date(),
      userId: 'some user id',
      userLogin: 'some user login',
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
