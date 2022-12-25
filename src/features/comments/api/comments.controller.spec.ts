import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';

import { AuthService } from '../../auth/application/auth.service';
import { Blog, BlogSchema } from '../../blogs/domain/schemas/blogs.schema';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { EmailTemplateManager } from '../../email/application/email-template-manager';
import { EmailService } from '../../email/application/email.service';
import { LikesService } from '../../likes/application/likes.service';
import {
  CommentLike,
  CommentLikeSchema,
} from '../../likes/domain/schemas/comment-likes.schema';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { LikesRepositorySql } from '../../likes/infrastructure/likes.repository.sql';
import { PasswordRecoveryService } from '../../password-recovery/application/password-recovery.service';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from '../../password-recovery/domain/schemas/recovery-password.schema';
import { RecoveryPasswordRepository } from '../../password-recovery/infrastructure/recovery-password.repository';
import { Post, PostSchema } from '../../posts/domain/schemas/posts.schema';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { User, UserSchema } from '../../users/schemas/users.schema';
import { UsersRepository } from '../../users/users.repository';
import { UsersService } from '../../users/users.service';
import { CommentsService } from '../application/comments.service';
import { Comment, CommentSchema } from '../domain/schemas/comments.schema';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';

import { CommentsController } from './comments.controller';

describe('CommentsController', () => {
  let commentController: CommentsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let passwordRecoveryModel: Model<PasswordRecovery>;

  let blogModel: Model<Blog>;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;
  let userModel: Model<User>;
  let likeModel: Model<CommentLike>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    passwordRecoveryModel = mongoConnection.model(
      PasswordRecovery.name,
      PasswordRecoverySchema,
    );

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    likeModel = mongoConnection.model(CommentLike.name, CommentLikeSchema);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        AuthService,
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        JwtService,
        UsersService,
        UsersRepository,
        PasswordRecoveryService,
        RecoveryPasswordRepository,
        {
          provide: getModelToken(PasswordRecovery.name),
          useValue: passwordRecoveryModel,
        },
        ConfigService,

        PostsRepository,
        BlogsRepository,
        CommentsService,
        CommentsRepository,
        CommentsQueryRepository,
        { provide: getModelToken(Blog.name), useValue: blogModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(User.name), useValue: userModel },
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
