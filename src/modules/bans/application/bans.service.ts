import { Injectable } from '@nestjs/common';

import { BansRepositorySql } from '../infrastructure/bans.repository.sql';

import { FindBanInput } from './input/find-ban.input';

@Injectable()
export class BansService {
  constructor(private readonly bansRepo: BansRepositorySql) {}

  async getBan(data: FindBanInput) {
    return this.bansRepo.getBan(data);
  }
}
