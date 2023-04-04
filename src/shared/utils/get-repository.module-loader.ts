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
  if (configService.get<string>('MODE') === 'rawSql') {
    return rawSqlModule;
  } else {
    return sqlModule;
  }
};
