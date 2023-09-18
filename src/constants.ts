import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

export enum BaseAuthPayload {
  login = 'admin',
  password = 'qwerty',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});
