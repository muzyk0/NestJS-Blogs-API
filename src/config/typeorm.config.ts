import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { Like } from '../features/likes/domain/entity/like.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get('POSTGRESQL_URI'),
  entities: [Like],
  synchronize: false,
  ssl: true,
  migrations: [__dirname, 'dist/migrations/*.js'],
  subscribers: [__dirname, 'dist/subscribers/**/*{.ts,.js}'],
});
