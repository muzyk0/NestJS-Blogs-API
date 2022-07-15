import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { BloggersService } from '../bloggers/bloggers.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { getModelToken } from '@nestjs/mongoose';
import { BloggerDto } from '../bloggers/dto/blogger.dto';
import { BloggersController } from '../bloggers/bloggers.controller';
import { PostDto } from './dto/post.dto';
import { PostsRepository } from './posts.repository';
import { Post, PostSchema } from './schemas/posts.schema';

describe('PostsController', () => {
  let blogger: BloggerDto;
  let post: PostDto;

  let postsController: PostsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bloggerModel: Model<Blogger>;
  let postModel: Model<Post>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        PostsRepository,
        BloggersRepository,
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
        { provide: getModelToken(Post.name), useValue: postModel },
      ],
    }).compile();
    postsController = app.get<PostsController>(PostsController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('postsController should be defined', async () => {
    expect(postsController).toBeDefined();
  });
});
