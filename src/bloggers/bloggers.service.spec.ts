import { Test, TestingModule } from '@nestjs/testing';
import { BloggersService } from './bloggers.service';
import { BloggersRepository } from './bloggers.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Blogger, BloggerSchema } from './schemas/bloggers.schema';
import { BloggerDto } from './dto/blogger.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Promise } from 'mongoose';

describe('BloggersService', () => {
  let bloggerService: BloggersService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bloggerModel: Model<Blogger>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BloggersService,
        BloggersRepository,
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
      ],
    }).compile();
    bloggerService = app.get<BloggersService>(BloggersService);
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

  it('BloggersService should be defined', async () => {
    expect(bloggerService).toBeDefined();
  });

  it('first blogger should be created', async () => {
    const newBlogger = await bloggerService.create({
      name: 'Vlad',
      youtubeUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    expect(bloggerService).toBeDefined();
    expect(newBlogger.name).toBe('Vlad');

    const bloggerInDb = await bloggerService.findOne(newBlogger!.id);
    expect(bloggerInDb.name).toBe(newBlogger.name);
  });

  it('bloggers is empty', async () => {
    const bloggers = await bloggerService.findAll();

    expect(bloggers!.length).toBe(0);
  });

  it('blogger should be removed', async () => {
    const newBlogger = await bloggerService.create({
      name: 'Vlad',
      youtubeUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    const isRemoved = await bloggerService.remove(newBlogger.id);
    const bloggers = await bloggerService.findAll();

    expect(isRemoved).toBeTruthy();
    expect(bloggers!.length).toBe(0);
  });

  it('bloggers should be removed', async () => {
    await Promise.all(
      new Array(10).fill(undefined).map((_, i) => {
        return bloggerService.create({
          name: `Vlad ${i}`,
          youtubeUrl: `https://www.youtube.com/channel/${i}`,
        });
      }),
    );

    const bloggers = await bloggerService.findAll();

    expect(bloggers!.length).toBe(10);

    await Promise.all(bloggers.map(({ id }) => bloggerService.remove(id)));

    const bloggersIsEmpty = await bloggerService.findAll();

    expect(bloggersIsEmpty!.length).toBe(0);
  });
});
