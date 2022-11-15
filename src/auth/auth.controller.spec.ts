import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { EmailTemplateManager } from '../email/email-template-manager';
import { EmailService } from '../email/email.service';
import { LimitsRepository } from '../limits/limits.repository';
import { LimitsService } from '../limits/limits.service';
import { Limit, LimitSchema } from '../limits/schemas/limits.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { SecurityRepository } from '../security/security.repository';
import { SecurityService } from '../security/security.service';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtJwtStrategy } from './strategies/at.jwt.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let userModel: Model<User>;
  let limitModel: Model<Limit>;
  let securityModel: Model<Security>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    userModel = mongoConnection.model(User.name, UserSchema);
    limitModel = mongoConnection.model(Limit.name, LimitSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'access_token_secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        LimitsService,
        LimitsRepository,
        AuthService,
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Limit.name), useValue: limitModel },
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        AtJwtStrategy,
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
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
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
