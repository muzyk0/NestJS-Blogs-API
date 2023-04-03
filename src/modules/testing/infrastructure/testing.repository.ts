import fs from 'fs';
import * as path from 'path';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  // path.join(__dirname, 'truncate-tables.sql')
  async onModuleInit() {
    // await fs.readFile(path.join(__dirname, 'truncate-tables.sql'), );
    // await this.dataSource.query(`
    //    DO $_$
    // BEGIN
    //     BEGIN
    //         SELECT 'public.truncate_tables(text)'::regprocedure;
    //     EXCEPTION WHEN undefined_function THEN
    //     -- do something here, i.e. create function
    //     END;
    // END $_$;
    // `);
  }

  private async clearSqlDatabase(): Promise<boolean> {
    await this.dataSource.query(`
       SELECT truncate_tables();
    `);

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    const isEnableClearDB = this.config.get('ENABLE_CLEAR_DB_ENDPOINT');
    if (isEnableClearDB) {
      await this.clearSqlDatabase();
    }

    return isEnableClearDB;
  }
}
