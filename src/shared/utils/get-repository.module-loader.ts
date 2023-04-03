import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

/**
 * Отдает нужные репозиторий в зависимости от мода.
 * Доступные моды: sql, rawSql
 * @param sqlModule
 * @param rawSqlModule
 */
export const getRepositoryModule = <T, R>(
  sqlModule: T,
  rawSqlModule: R,
): T | R => {
  return configService.get<string>('MODE') !== 'rawSql'
    ? sqlModule
    : rawSqlModule;
};
