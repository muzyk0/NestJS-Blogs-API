import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';

import { Blog, BlogSchema } from '../../blogs/domain/schemas/blogs.schema';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { LikesService } from '../../likes/application/likes.service';
import {
  CommentLike,
  CommentLikeSchema,
} from '../../likes/domain/schemas/comment-likes.schema';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { LikesRepositorySql } from '../../likes/infrastructure/likes.repository.sql';
import { PostsRepository } from '../../posts/posts.repository';
import { Post, PostSchema } from '../../posts/schemas/posts.schema';
import { Comment, CommentSchema } from '../domain/schemas/comments.schema';
import { CommentsRepository } from '../infrastructure/comments.repository';

import { CommentsService } from './comments.service';

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