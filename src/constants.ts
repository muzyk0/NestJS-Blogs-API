import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

export enum BaseAuthPayload {
  login = 'admin',
  password = 'qwerty',
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});
