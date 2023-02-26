import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';

import {
  Comment,
  CommentDocument,
} from '../../comments/domain/schemas/comments.schema';

@Injectable()
export class TestingRepository {
  constructor(
    private readonly config: ConfigService,
    private dataSource: DataSource,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  private async clearSqlDatabase(): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query(`
        DELETE
        FROM "likes";
        DELETE
        FROM "revoke_tokens";
        DELETE
        FROM "bans";
        DELETE
        FROM "devices";
        DELETE
        FROM "posts";
        DELETE
        FROM "blogs";
        DELETE
        FROM "users";
    `);

    await queryRunner.release();

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    if (this.config.get('ENABLE_CLEAR_DB_ENDPOINT')) {
      await this.clearSqlDatabase();

      await this.commentModel.deleteMany({});
    }

    return true;
  }
}
