import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';

import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/schemas/blogs.schema';
import { LikesRepository } from '../likes/likes.repository';
import { LikesRepositorySql } from '../likes/likes.repository.sql';
import { LikesService } from '../likes/likes.service';
import {
  CommentLike,
  CommentLikeSchema,
} from '../likes/schemas/comment-likes.schema';
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
  let blogModel: Model<Blog>;
  let likeModel: Model<CommentLike>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    likeModel = mongoConnection.model(CommentLike.name, CommentLikeSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        CommentsRepository,
        PostsRepository,
        BlogsRepository,
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Blog.name), useValue: blogModel },
        LikesService,
        LikesRepository,
        { provide: getModelToken(CommentLike.name), useValue: likeModel },
        LikesRepositorySql,
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
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
