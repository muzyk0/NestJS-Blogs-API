import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CommentLikesRepository } from './comment-likes.repository';
import { CommentLikesService } from './comment-likes.service';
import { CommentLike, CommentLikeSchema } from './schemas/comment-likes.schema';

describe('CommentLikesService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let commentLikesService: CommentLikesService;

  let commentLikeModel: Model<CommentLike>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    commentLikeModel = mongoConnection.model(
      CommentLike.name,
      CommentLikeSchema,
    );

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CommentLikesService,
        CommentLikesRepository,
        {
          provide: getModelToken(CommentLike.name),
          useValue: commentLikeModel,
        },
      ],
    }).compile();
    commentLikesService = app.get<CommentLikesService>(CommentLikesService);
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

  it('should be defined', () => {
    expect(commentLikesService).toBeDefined();
  });
});
