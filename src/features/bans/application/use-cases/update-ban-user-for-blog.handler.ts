import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BanUserForBlogInput } from '../../../blogs/api/dto/ban-user-for-blog.input';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { BansRepositorySql } from '../../infrastructure/bans.repository.sql';
import { CreateBanInput } from '../input/create-ban.input';
import { BanTypeEnum } from '../interfaces/ban-type.enum';

export class UpdateBanUserForBlogCommand {
  constructor(
    public readonly createBanInput: BanUserForBlogInput,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdateBanUserForBlogCommand)
export class UpdateBanUserForBlogHandler
  implements ICommandHandler<UpdateBanUserForBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly bansRepositorySql: BansRepositorySql,
  ) {}

  async execute({ createBanInput, userId }: UpdateBanUserForBlogCommand) {
    const blog = await this.blogsRepository.findOne(userId);

    if (blog && blog.userId === userId) {
      throw new BadRequestException();
    }

    const updateBan: CreateBanInput = {
      isBanned: createBanInput.isBanned,
      banReason: createBanInput.banReason,
      userId: userId,
      parentId: createBanInput.blogId,
      type: BanTypeEnum.BLOG,
    };
    return this.bansRepositorySql.updateOrCreateBan(updateBan);
  }
}
