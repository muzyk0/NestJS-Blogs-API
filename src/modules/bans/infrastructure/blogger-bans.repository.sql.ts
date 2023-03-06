import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import { FindBanInput } from '../application/input/find-ban.input';
import { BlogsBans } from '../domain/entity/blogger-bans.entity';

export abstract class IBloggerBansRepositorySql {
  abstract updateOrCreateBan(
    createBanInput: CreateBanInput,
  ): Promise<BlogsBans>;

  abstract findOne({ userId, blogId }: FindBanInput): Promise<BlogsBans>;
}

@Injectable()
export class BloggerBansRepositorySql implements IBloggerBansRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateOrCreateBan(createBanInput: CreateBanInput): Promise<BlogsBans> {
    const banned = createBanInput.isBanned ? new Date() : null;

    const [ban]: [BlogsBans] = await this.dataSource.query(
      `
          INSERT INTO blogs_bans ("userId", "blogId", "banned", "banReason")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE
              SET "banned"    = $4,
                  "banReason" = $5
          RETURNING *
      `,
      [
        createBanInput.userId,
        createBanInput.blogId,
        banned,
        createBanInput.banReason,
      ],
    );

    return ban;
  }

  async findOne({ userId, blogId }: FindBanInput) {
    const ban: BlogsBans[] = await this.dataSource.query(
      `
          SELECT *
          FROM blogs_bans
          WHERE "userId" = $1
            AND "blogId" = $2
      `,
      [userId, blogId],
    );

    return ban[0];
  }

  // async getBansByBlogId({ blogId }: FindBanByBlogIdInput) {
  //   const bans: BlogsBans[] = await this.dataSource.query(
  //     `
  //         SELECT *
  //         FROM blogs_bans
  //         WHERE "parentId" = $1
  //           AND "isBanned" = $3
  //     `,
  //     [blogId, true],
  //   );
  //
  //   return bans;
  // }
}
