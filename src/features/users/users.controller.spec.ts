import { MailerService } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { AuthService } from '../auth/application/auth.service';
import { EmailTemplateManager } from '../email/application/email-template-manager';
import { EmailService } from '../email/application/email.service';
import { PasswordRecoveryService } from '../password-recovery/password-recovery.service';
import { RecoveryPasswordRepository } from '../password-recovery/recovery-password.repository';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from '../password-recovery/schemas/recovery-password.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { SecurityRepository } from '../security/security.repository';
import { SecurityService } from '../security/security.service';

import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let userModel: Model<User>;
  let securityModel: Model<Security>;
  let passwordRecoveryModel: Model<PasswordRecovery>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);
    passwordRecoveryModel = mongoConnection.model(
      PasswordRecovery.name,
      PasswordRecoverySchema,
    );

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      controllers: [UsersController],
      providers: [
        ConfigService,
        UsersService,
        UsersRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        AuthService,
        EmailService,
        EmailTemplateManager,
        { provide: 'BASE_URL', useValue: 'empty_url' },
        { provide: MailerService, useValue: jest.fn() },
        JwtService,
        SecurityService,
        SecurityRepository,
        { provide: getModelToken(Security.name), useValue: securityModel },
        PasswordRecoveryService,
        RecoveryPasswordRepository,
        {
          provide: getModelToken(PasswordRecovery.name),
          useValue: passwordRecoveryModel,
        },
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
