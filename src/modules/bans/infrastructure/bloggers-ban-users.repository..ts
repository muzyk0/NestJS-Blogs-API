import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import { FindBanInput } from '../application/input/find-ban.input';
import { BloggerBanUser } from '../domain/entity/blogger-ban-user';

export abstract class IBloggersBanUsersRepository {
  abstract updateOrCreateBan(
    createBanInput: CreateBanInput,
  ): Promise<BloggerBanUser>;

  abstract findOne({ userId, blogId }: FindBanInput): Promise<BloggerBanUser>;
}

@Injectable()
export class BloggersBanUsersRepository implements IBloggersBanUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateOrCreateBan(
    createBanInput: CreateBanInput,
  ): Promise<BloggerBanUser> {
    const banned = createBanInput.isBanned ? new Date() : null;

    const [ban]: [BloggerBanUser] = await this.dataSource.query(
      `
          INSERT INTO bloggers_ban_users ("userId", "blogId", "banned", "banReason")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE
              SET "banned"    = $3,
                  "banReason" = $4
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
    const ban: BloggerBanUser[] = await this.dataSource.query(
      `
          SELECT *
          FROM bloggers_ban_users
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
  //         FROM bloggers_ban_users
  //         WHERE "parentId" = $1
  //           AND "isBanned" = $3
  //     `,
  //     [blogId, true],
  //   );
  //
  //   return bans;
  // }
}
