import { MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: AuthService;

  let userModel: Model<User>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    userModel = mongoConnection.model(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
