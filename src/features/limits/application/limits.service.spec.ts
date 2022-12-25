import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { Limit, LimitSchema } from '../domain/schemas/limits.schema';
import { LimitsRepository } from '../infrastructure/limits.repository';

import { LimitsService } from './limits.service';

describe('LimitsService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let service: LimitsService;
  let limitsModel: Model<Limit>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    limitsModel = mongoConnection.model(Limit.name, LimitSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LimitsService,
        LimitsRepository,
        { provide: getModelToken(Limit.name), useValue: limitsModel },
      ],
    }).compile();

    service = module.get<LimitsService>(LimitsService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
