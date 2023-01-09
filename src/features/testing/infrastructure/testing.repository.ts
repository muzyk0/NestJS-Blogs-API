import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(
    private readonly config: ConfigService,
    @InjectConnection()
    private readonly connection: Connection,
    private dataSource: DataSource,
  ) {}

  private async clearSqlDatabase(): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query(`
        DELETE
        FROM likes
    `);

    await queryRunner.release();

    return true;
  }

  private async clearMongoDatabase(): Promise<boolean> {
    const collections = Object.values(this.connection.collections);

    await Promise.all(
      collections.map(async (collection) => {
        return collection.deleteMany({});
      }),
    );

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    if (this.config.get('ENABLE_CLEAR_DB_ENDPOINT')) {
      await this.clearSqlDatabase();
      await this.clearMongoDatabase();
    }

    return true;
  }
}
