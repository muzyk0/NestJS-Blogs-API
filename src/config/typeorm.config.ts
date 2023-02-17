import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { RevokeToken } from '../features/auth/domain/entities/revoked-token.entity';
import { Ban } from '../features/bans/domain/entity/ban.entity';
import { Like } from '../features/likes/domain/entity/like.entity';
import { User } from '../features/users/domain/entities/user.entity';

config();

const configService = new ConfigService();
console.log(
  "configService.get('POSTGRESQL_URI')",
  configService.get('POSTGRESQL_URI'),
);
export default new DataSource({
  type: 'postgres',
  url: configService.get('POSTGRESQL_URI'),
  // entities: [Like],
  synchronize: true,
  ssl: configService.get('TYPEORM_SSL'),
  // entities: [__dirname, 'dist/**/*.entity.js'],
  entities: [Like, Ban, User, RevokeToken],
  migrations: [__dirname, 'dist/migrations/**/*.js'],
  subscribers: [__dirname, 'dist/subscribers/**/*.js'],
});
