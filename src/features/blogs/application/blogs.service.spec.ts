/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Promise } from 'mongoose';

import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { Blog, BlogSchema } from '../domain/schemas/blogs.schema';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';

import { BlogsService } from './blogs.service';

describe('BlogsService', () => {
  let blogService: BlogsService;
  let blogsQueryRepository: BlogsQueryRepository;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let blogModel: Model<Blog>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        BlogsRepository,
        BlogsQueryRepository,
        { provide: getModelToken(Blog.name), useValue: blogModel },
      ],
    }).compile();
    blogService = app.get<BlogsService>(BlogsService);
    blogsQueryRepository = app.get<BlogsQueryRepository>(BlogsQueryRepository);
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

  it('BlogsService should be defined', async () => {
    expect(blogService).toBeDefined();
  });

  it('first blog should be created', async () => {
    const newBlog = await blogService.create({
      name: 'Vlad',
      description: 'description',
      websiteUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    expect(blogService).toBeDefined();
    expect(newBlog.name).toBe('Vlad');

    const blogInDb = await blogService.findOne(newBlog!.id);
    expect(blogInDb.name).toBe(newBlog.name);
  });

  it('blogs is empty', async () => {
    const blogs = await blogsQueryRepository.findAll(new PageOptionsDto());

    expect(blogs!.items.length).toBe(0);
  });

  it('blog should be removed', async () => {
    const newBlog = await blogService.create({
      name: 'Vlad',
      description: 'description',
      websiteUrl: 'https://www.youtube.com/channel/UCcZ18YvVGS7tllvrxN5IAAQ',
    });

    const isRemoved = await blogService.remove(newBlog.id);
    const blogs = await blogsQueryRepository.findAll(new PageOptionsDto());

    expect(isRemoved).toBeTruthy();
    expect(blogs!.items.length).toBe(0);
  });

  it('blog should be removed', async () => {
    await Promise.all(
      new Array(10).fill(undefined).map((_, i) => {
        return blogService.create({
          name: `Vlad ${i}`,
          description: 'description',
          websiteUrl: `https://www.youtube.com/channel/${i}`,
        });
      }),
    );

    const blogs = await blogsQueryRepository.findAll(new PageOptionsDto());

    expect(blogs!.items.length).toBe(10);

    await Promise.all(blogs!.items.map(({ id }) => blogService.remove(id)));

    const blogsIsEmpty = await blogsQueryRepository.findAll(
      new PageOptionsDto(),
    );

    expect(blogsIsEmpty!.items.length).toBe(0);
  });
});
