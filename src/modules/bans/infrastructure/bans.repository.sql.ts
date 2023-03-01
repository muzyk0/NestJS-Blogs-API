import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import {
  FindBanByBlogIdInput,
  FindBanInput,
} from '../application/input/find-ban.input';
import { Ban } from '../domain/entity/ban.entity';

@Injectable()
export class BansRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateOrCreateBan(createBanInput: CreateBanInput): Promise<Ban> {
    const [ban]: [Ban] = await this.dataSource.query(
      `
          INSERT INTO bans ("userId", "parentId", type, "isBanned", "banReason")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE
              SET "isBanned"  = $4,
                  "banReason" = $5
          RETURNING *
      `,
      [
        createBanInput.userId,
        createBanInput.parentId,
        createBanInput.type,
        createBanInput.isBanned,
        createBanInput.banReason,
      ],
    );

    return ban;
  }

  async getBan({ userId, parentId, type }: FindBanInput) {
    const ban: Ban[] = await this.dataSource.query(
      `
          SELECT *
          FROM bans
          WHERE "userId" = $1
            AND "parentId" = $2
            AND "type" = $3
      `,
      [userId, parentId, type],
    );

    return ban[0];
  }

  async getBansByBlogId({ parentId, type }: FindBanByBlogIdInput) {
    const bans: Ban[] = await this.dataSource.query(
      `
          SELECT *
          FROM bans
          WHERE "parentId" = $1
            AND "type" = $2
            AND "isBanned" = $3
      `,
      [parentId, type, true],
    );

    return bans;
  }
}
