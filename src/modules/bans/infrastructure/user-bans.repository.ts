import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BanUnbanUserInput } from '../../users/application/dto/ban-unban-user.input';
import { IUserBanRepository } from '../application/interfaces/user-ban.abstract-class';
import { Bans } from '../domain/entity/bans.entity';

@Injectable()
export class UserBanRepository implements IUserBanRepository {
  constructor(
    @InjectRepository(Bans) private readonly repo: Repository<Bans>,
  ) {}

  async createOrUpdateBan(
    id: string,
    payload: BanUnbanUserInput,
  ): Promise<boolean> {
    const banned = payload.isBanned ? new Date() : null;
    const banReason = payload.isBanned ? payload.banReason : null;

    const ban = await this.repo.upsert({ userId: id, banned, banReason }, [
      'userId',
    ]);

    if (!ban.identifiers[0]) {
      return false;
    }

    return true;
  }
}
