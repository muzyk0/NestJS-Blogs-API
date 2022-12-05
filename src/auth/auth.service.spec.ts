import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { AtJwtStrategy } from './strategies/at.jwt.strategy';

describe('AuthService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: AuthService;

  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'access_token_secret',
          signOptions: { expiresIn: '60s' },
        }),
        // SecurityModule,
        // ConfigModule.forRoot({}),
      ],
      providers: [
        AuthService,
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: MailerService, useValue: jest.fn() },
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ACCESS_TOKEN_SECRET') {
                return 'ACCESS_TOKEN_SECRET';
              }

              return null;
            }),
          },
        },
        AtJwtStrategy,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
