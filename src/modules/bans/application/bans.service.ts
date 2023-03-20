import { Injectable } from '@nestjs/common';

import { IBloggersBanUsersRepository } from '../infrastructure/bloggers-ban-users-repository.service';

import { FindBanInput } from './input/find-ban.input';

@Injectable()
export class BansService {
  constructor(private readonly bansRepo: IBloggersBanUsersRepository) {}

  async getBan(data: FindBanInput) {
    return this.bansRepo.findOne(data);
  }
}
