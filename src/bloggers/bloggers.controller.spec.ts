import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BloggersController } from './bloggers.controller';
import { BloggersRepository } from './bloggers.repository';
import { BloggersService } from './bloggers.service';
import { BloggerDto } from './dto/blogger.dto';
import { Blogger, BloggerSchema } from './schemas/bloggers.schema';

describe('BloggersController', () => {
  let blogger: BloggerDto;

  let bloggerController: BloggersController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bloggerModel: Model<Blogger>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BloggersController],
      providers: [
        BloggersService,
        BloggersRepository,
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
      ],
    }).compile();
    bloggerController = app.get<BloggersController>(BloggersController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  // afterEach(async () => {
  //   const collections = mongoConnection.collections;
  //   for (const key in collections) {
  //     const collection = collections[key];
  //     await collection.deleteMany({});
  //   }
  // });

  it('bloggerController should be defined', async () => {
    expect(bloggerController).toBeDefined();
  });

  it('first blogger should be created', async () => {
    const newBlogger = await bloggerController.create({
      name: 'Vlad',
      youtubeUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    blogger = newBlogger;

    expect(bloggerController).toBeDefined();
    expect(newBlogger.name).toBe('Vlad');
  });

  it('blogger should be defined', async () => {
    const bloggerInDb = await bloggerController.findOne(blogger!.id);
    expect(bloggerInDb.name).toBe(blogger.name);
  });

  it('two bloggers should be created', async () => {
    const firstBlogger = await bloggerController.create({
      name: 'Vlad 2',
      youtubeUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    blogger = firstBlogger;

    expect(bloggerController).toBeDefined();
    expect(firstBlogger.name).toBe('Vlad 2');
  });

  it('bloggers should be equal 3 length', async () => {
    const bloggers = await bloggerController.findAll();

    expect(bloggers!.length).toBe(2);
  });

  it('blogger should be removed', async () => {
    const isRemoved = await bloggerController.remove(blogger.id);
    const bloggers = await bloggerController.findAll();

    expect(isRemoved).toBeTruthy();
    expect(bloggers!.length).toBe(1);
    expect(bloggers![0].name).not.toBe(blogger.name);
  });

  it('bloggers should be removed', async () => {
    const bloggers = await bloggerController.findAll();
    const isRemoved = await bloggerController.remove(bloggers[0].id);
    const bloggersIsEmpty = await bloggerController.findAll();

    expect(isRemoved).toBeTruthy();
    expect(bloggersIsEmpty!.length).toBe(0);
  });
});
