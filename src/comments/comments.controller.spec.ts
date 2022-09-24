import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/schemas/blogs.schema';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';

import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from './schemas/comments.schema';

describe('CommentsController', () => {
  let commentController: CommentsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let blogModel: Model<Blog>;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    userModel = mongoConnection.model(User.name, UserSchema);

    const app: TestingModule = await Test.createTestingModule({
      // imports: [AuthModule],
      controllers: [CommentsController],
      providers: [
        PostsRepository,
        BlogsRepository,
        CommentsService,
        CommentsRepository,
        { provide: getModelToken(Blog.name), useValue: blogModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    commentController = app.get<CommentsController>(CommentsController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('commentController should be defined', async () => {
    expect(commentController).toBeDefined();
  });
});
