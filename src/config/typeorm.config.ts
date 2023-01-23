import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

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
  synchronize: false,
  ssl: configService.get('TYPEORM_SSL'),
  entities: [__dirname, 'dist/**/*.entity.js'],
  migrations: [__dirname, 'dist/migrations/**/*.js'],
  subscribers: [__dirname, 'dist/subscribers/**/*.js'],
});
