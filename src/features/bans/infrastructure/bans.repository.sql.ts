import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import {
  FindBanByBlogIdInput,
  FindBanInput,
} from '../application/input/find-ban.input';
import { Ban } from '../domain/entity/ban.entity';

@Injectable()
export class BansRepositorySql {
  constructor(private dataSource: DataSource) {}

  async updateOrCreateBan(createBanInput: CreateBanInput): Promise<Ban> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const ban: Ban[] = await queryRunner.query(
      `
          SELECT *
          FROM bans
          WHERE "userId" = $1
            AND "parentId" = $2
            AND "type" = $3
      `,
      [createBanInput.userId, createBanInput.parentId, createBanInput.type],
    );

    if (ban?.[0]?.id) {
      const updatedBan: Ban[] = await queryRunner.query(
        `
            UPDATE bans
            SET "isBanned"  = $2,
                "banReason" = $3,
                "updatedAt" = $4
            WHERE "id" = $1;
        `,
        [
          ban[0].id,
          createBanInput.isBanned,
          createBanInput.banReason,
          new Date(),
        ],
      );

      await queryRunner.release();

      return updatedBan[0];
    }

    const createdLike: Ban[] = await queryRunner.query(
      `
          INSERT
          INTO bans ("userId", "parentId", "type", "isBanned", "banReason")
          VALUES ($1, $2, $3, $4, $5)
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

    await queryRunner.release();

    return createdLike[0];
  }

  async getBan({ userId, parentId, type }: FindBanInput) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const ban: Ban[] = await queryRunner.query(
      `
          SELECT *
          FROM bans
          WHERE "userId" = $1
            AND "parentId" = $2
            AND "type" = $3
      `,
      [userId, parentId, type],
    );

    await queryRunner.release();

    console.log(ban);

    return ban[0];
  }

  async getBansByBlogId({ parentId, type }: FindBanByBlogIdInput) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const bans: Ban[] = await queryRunner.query(
      `
          SELECT *
          FROM bans
          WHERE "parentId" = $1
            AND "type" = $2
            AND "isBanned" = $3
      `,
      [parentId, type, false],
    );

    await queryRunner.release();

    return bans;
  }
}
