import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { SecurityService } from '../application/security.service';
import { Security, SecuritySchema } from '../domain/schemas/security.schema';
import { SecurityQueryRepository } from '../infrastructure/security.query.repository';
import { SecurityRepository } from '../infrastructure/security.repository';

import { SecurityController } from './security.controller';

describe('SecurityController', () => {
  let controller: SecurityController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let securityModel: Model<Security>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    securityModel = mongoConnection.model(Security.name, SecuritySchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        SecurityService,
        SecurityRepository,
        SecurityQueryRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
