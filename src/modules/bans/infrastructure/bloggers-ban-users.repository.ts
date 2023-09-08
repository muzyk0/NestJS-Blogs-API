import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBanInput } from '../application/input/create-ban.input';
import { IBloggersBanUsersRepository } from '../application/interfaces/bloggers-ban-users.abstract-class';
import { BloggerBanUser } from '../domain/entity/blogger-ban-user.entity';

@Injectable()
export class BloggersBanUsersRepository implements IBloggersBanUsersRepository {
  constructor(
    @InjectRepository(BloggerBanUser)
    private readonly repo: Repository<BloggerBanUser>,
  ) {}

  async updateOrCreateBan(
    createBanInput: CreateBanInput,
  ): Promise<BloggerBanUser> {
    const banned = createBanInput.isBanned ? new Date() : undefined;

    const ban = await this.repo.upsert(
      {
        userId: createBanInput.userId,
        blogId: createBanInput.blogId,
        banned,
        banReason: createBanInput.banReason,
      },
      ['id'],
    );

    return this.repo.findOneOrFail({ where: { id: ban.identifiers[0].id } });
  }
}
