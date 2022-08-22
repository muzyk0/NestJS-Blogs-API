import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { BloggersService } from '../bloggers/bloggers.service';
import { BloggerDto } from '../bloggers/dto/blogger.dto';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentsService } from '../comments/comments.service';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { PostDto } from './dto/post.dto';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';

describe('PostsController', () => {
  let blogger: BloggerDto;
  let post: PostDto;

  let postsController: PostsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bloggerModel: Model<Blogger>;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    userModel = mongoConnection.model(User.name, UserSchema);

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      controllers: [PostsController],
      providers: [
        PostsService,
        PostsRepository,
        BloggersService,
        BloggersRepository,
        CommentsService,
        CommentsRepository,
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(User.name), useValue: userModel },
        AuthService,
        UsersService,
        UsersRepository,
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        JwtService,
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
