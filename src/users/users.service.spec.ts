import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let userService: UsersService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    userService = app.get<UsersService>(UsersService);
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

  it('userService should be defined', async () => {
    expect(userService).toBeDefined();
  });
});
