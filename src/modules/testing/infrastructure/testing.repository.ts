import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private async clearSqlDatabase(): Promise<boolean> {
    await this.dataSource.query(`
       SELECT truncate_tables();
    `);

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    const isEnableClearDB = this.config.get('ENABLE_CLEAR_DB_ENDPOINT');
    // if (isEnableClearDB) {
    await this.clearSqlDatabase();
    // }

    return isEnableClearDB;
  }
}
