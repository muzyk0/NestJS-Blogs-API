import { Injectable } from '@nestjs/common';

import {
  BloggerBansRepositorySql,
  IBloggerBansRepositorySql,
} from '../infrastructure/blogger-bans.repository.sql';

import { FindBanInput } from './input/find-ban.input';

@Injectable()
export class BansService {
  constructor(private readonly bansRepo: IBloggerBansRepositorySql) {}

  async getBan(data: FindBanInput) {
    return this.bansRepo.findOne(data);
  }
}
