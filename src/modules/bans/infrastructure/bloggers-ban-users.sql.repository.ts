import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import { IBloggersBanUsersRepository } from '../application/interfaces/bloggers-ban-users.abstract-class';
import { BloggerBanUser } from '../domain/entity/blogger-ban-user.entity';

@Injectable()
export class BloggersBanUsersSqlRepository
  implements IBloggersBanUsersRepository
{
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
}
