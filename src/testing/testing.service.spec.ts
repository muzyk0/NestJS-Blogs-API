import { Test, TestingModule } from '@nestjs/testing';
import { TestingService } from './testing.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Promise } from 'mongoose';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { TestingRepository } from './testing.repository';
import { v4 } from 'uuid';
import { BloggerDto } from '../bloggers/dto/blogger.dto';

describe('TestingService', () => {
  let countAll = 0;

  let service: TestingService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let postModel: Model<Post>;
  let bloggerModel: Model<Blogger>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    postModel = mongoConnection.model(Post.name, PostSchema);
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        TestingService,
        TestingRepository,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
      ],
    }).compile();
    service = app.get<TestingService>(TestingService);
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

    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      countAll += await collection.countDocuments({});
    }

    expect(countAll).toBe(countAll);
    expect(countAll).not.toBe(0);
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

    const result = await service.clearDatabase();

    const postCountAfterClearDb = await postModel.countDocuments({});

    expect(result).toBeTruthy();
    expect(postCountAfterClearDb).not.toBe(countAll);
    expect(postCountAfterClearDb).toBe(0);
  });
});
