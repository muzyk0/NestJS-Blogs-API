import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { Security, SecuritySchema } from '../domain/schemas/security.schema';
import { SecurityRepository } from '../infrastructure/security.repository';

import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let securityModel: Model<Security>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    securityModel = mongoConnection.model(Security.name, SecuritySchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
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
