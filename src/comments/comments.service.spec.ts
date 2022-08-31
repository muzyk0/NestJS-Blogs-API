import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BloggersRepository } from '../bloggers/bloggers.repository';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostSchema } from '../posts/schemas/posts.schema';

import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from './schemas/comments.schema';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let commentModel: Model<Comment>;
  let postModel: Model<Post>;
  let bloggerModel: Model<Blogger>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        CommentsRepository,
        PostsRepository,
        BloggersRepository,
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
      ],
    }).compile();
    commentsService = app.get<CommentsService>(CommentsService);
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

  it('commentsService should be defined', async () => {
    expect(commentsService).toBeDefined();
  });
});
