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
        DELETE
        FROM "likes";
        DELETE
        FROM "revoke_tokens";
        DELETE
        FROM "bans";
        DELETE
        FROM "devices";
        DELETE 
        FROM "comments";
        DELETE
        FROM "posts";
        DELETE
        FROM "blogs";
        DELETE
        FROM "users";
    `);

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    if (this.config.get('ENABLE_CLEAR_DB_ENDPOINT')) {
      await this.clearSqlDatabase();
    }

    return true;
  }
}
