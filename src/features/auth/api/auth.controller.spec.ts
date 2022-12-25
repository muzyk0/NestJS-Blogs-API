import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { EmailTemplateManager } from '../../email/application/email-template-manager';
import { EmailService } from '../../email/application/email.service';
import { LimitsService } from '../../limits/application/limits.service';
import { Limit, LimitSchema } from '../../limits/domain/schemas/limits.schema';
import { LimitsRepository } from '../../limits/infrastructure/limits.repository';
import { PasswordRecoveryService } from '../../password-recovery/application/password-recovery.service';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from '../../password-recovery/domain/schemas/recovery-password.schema';
import { RecoveryPasswordRepository } from '../../password-recovery/infrastructure/recovery-password.repository';
import { SecurityService } from '../../security/application/security.service';
import {
  Security,
  SecuritySchema,
} from '../../security/domain/schemas/security.schema';
import { SecurityRepository } from '../../security/infrastructure/security.repository';
import { UsersService } from '../../users/application/users.service';
import { User, UserSchema } from '../../users/domain/schemas/users.schema';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { AuthService } from '../application/auth.service';
import { AtJwtStrategy } from '../strategies/at.jwt.strategy';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let userModel: Model<User>;
  let limitModel: Model<Limit>;
  let securityModel: Model<Security>;
  let passwordRecoveryModel: Model<PasswordRecovery>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    userModel = mongoConnection.model(User.name, UserSchema);
    limitModel = mongoConnection.model(Limit.name, LimitSchema);
    securityModel = mongoConnection.model(Security.name, SecuritySchema);
    passwordRecoveryModel = mongoConnection.model(
      PasswordRecovery.name,
      PasswordRecoverySchema,
    );

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
        PasswordRecoveryService,
        RecoveryPasswordRepository,
        {
          provide: getModelToken(PasswordRecovery.name),
          useValue: passwordRecoveryModel,
        },
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
