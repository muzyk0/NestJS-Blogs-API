import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';

import { AuthService } from '../auth/application/auth.service';
import { BlogsService } from '../blogs/application/blogs.service';
import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentsService } from '../comments/comments.service';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { LikesRepository } from '../likes/likes.repository';
import { LikesRepositorySql } from '../likes/likes.repository.sql';
import { LikesService } from '../likes/likes.service';
import {
  CommentLike,
  CommentLikeSchema,
} from '../likes/schemas/comment-likes.schema';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service';
import { RecoveryPasswordRepository } from '../password-recovery/recovery-password.repository';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from '../password-recovery/schemas/recovery-password.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { SecurityRepository } from '../security/security.repository';
import { SecurityService } from '../security/security.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';

describe('PostsController', () => {
  let postsController: PostsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let blogModel: Model<Blog>;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;
  let userModel: Model<User>;
  let securityModel: Model<Security>;
  let passwordRecoveryModel: Model<PasswordRecovery>;
  let commentLikeModel: Model<CommentLike>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);
    passwordRecoveryModel = mongoConnection.model(
      PasswordRecovery.name,
      PasswordRecoverySchema,
    );
    commentLikeModel = mongoConnection.model(
      CommentLike.name,
      CommentLikeSchema,
    );

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      controllers: [PostsController],
      providers: [
        PostsService,
        PostsRepository,
        PostsQueryRepository,
        BlogsService,
        BlogsRepository,
        CommentsService,
        CommentsRepository,
        CommentsQueryRepository,
        { provide: getModelToken(Blog.name), useValue: blogModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(User.name), useValue: userModel },
        AuthService,
        UsersService,
        UsersRepository,
        PasswordRecoveryService,
        RecoveryPasswordRepository,
        {
          provide: getModelToken(PasswordRecovery.name),
          useValue: passwordRecoveryModel,
        },
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        JwtService,
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
        LikesService,
        LikesRepository,
        {
          provide: getModelToken(CommentLike.name),
          useValue: commentLikeModel,
        },
        LikesRepositorySql,
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
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
