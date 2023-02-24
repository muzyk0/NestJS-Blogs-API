import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';

import { Blog, BlogDocument } from '../../blogs/domain/schemas/blogs.schema';
import {
  Comment,
  CommentDocument,
} from '../../comments/domain/schemas/comments.schema';
import { Post, PostDocument } from '../../posts/domain/schemas/posts.schema';

@Injectable()
export class TestingRepository {
  constructor(
    private readonly config: ConfigService,
    private dataSource: DataSource,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
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
        FROM "users";
        DELETE
        FROM devices;
    `);

    await queryRunner.release();

    return true;
  }

  async clearDatabase(): Promise<boolean> {
    if (this.config.get('ENABLE_CLEAR_DB_ENDPOINT')) {
      await this.clearSqlDatabase();

      await this.blogModel.deleteMany({});
      await this.postModel.deleteMany({});
      await this.commentModel.deleteMany({});
    }

    return true;
  }
}
