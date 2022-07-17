import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersController', () => {
  let user: User;

  let usersController: UsersController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    usersController = app.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('usersController should be defined', async () => {
    expect(usersController).toBeDefined();
  });
});
