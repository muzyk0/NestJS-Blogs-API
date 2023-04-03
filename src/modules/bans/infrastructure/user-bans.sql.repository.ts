import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BanUnbanUserInput } from '../../users/application/dto/ban-unban-user.input';
import { IUserBanRepository } from '../application/interfaces/i-user-ban.repository';
import { Bans } from '../domain/entity/bans.entity';

@Injectable()
export class UserBanSqlRepository implements IUserBanRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createOrUpdateBan(
    id: string,
    payload: BanUnbanUserInput,
  ): Promise<boolean> {
    const banned = payload.isBanned ? new Date() : null;
    const banReason = payload.isBanned ? payload.banReason : null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_ban]: [Bans] = await this.dataSource.query(
        `
            INSERT INTO bans ("userId", banned, "banReason")
            VALUES ($1, $2, $3)
            ON CONFLICT ("userId") DO UPDATE
                SET "banned"  = $2,
                    "banReason" = $3
            RETURNING *
        `,
        [id, banned, banReason],
      );

      return true;
    } catch (e) {
      return false;
    }
  }
}
