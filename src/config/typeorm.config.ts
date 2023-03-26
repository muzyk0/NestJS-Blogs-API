import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { entities } from './entities';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get('POSTGRESQL_URI'),
  // entities: [Like],
  synchronize: true,
  ssl: configService.get('TYPEORM_SSL'),
  // entities: [__dirname, 'dist/**/*.entity.js'],
  entities: entities,
  migrations: [__dirname, 'dist/migrations/**/*.js'],
  subscribers: [__dirname, 'dist/subscribers/**/*.js'],
  logging: false,
});
