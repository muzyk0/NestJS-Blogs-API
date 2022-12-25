import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { DataSource } from 'typeorm';

import {
  CommentLike,
  CommentLikeSchema,
} from '../domain/schemas/comment-likes.schema';
import { LikesRepository } from '../infrastructure/likes.repository';
import { LikesRepositorySql } from '../infrastructure/likes.repository.sql';

import { LikesService } from './likes.service';

describe('CommentLikesService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let commentLikesService: LikesService;

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
    commentLikesService = app.get<LikesService>(LikesService);
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
