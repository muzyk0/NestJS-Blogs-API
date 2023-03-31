import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const getRepositoryModule = <T, R>(
  sqlModule: T,
  rawSqlModule: R,
): T | R => {
  return configService.get<string>('MODE') !== 'rawSql'
    ? sqlModule
    : rawSqlModule;
};
