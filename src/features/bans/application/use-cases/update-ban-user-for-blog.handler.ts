import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BanUserForBlogInput } from '../../../blogs/api/dto/ban-user-for-blog.input';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BansRepositorySql } from '../../infrastructure/bans.repository.sql';
import { CreateBanInput } from '../input/create-ban.input';
import { BanTypeEnum } from '../interfaces/ban-type.enum';

export class UpdateBanUserForBlogCommand {
  constructor(
    public readonly createBanInput: BanUserForBlogInput,
    public readonly userId: string,
    public readonly authUserId: string,
  ) {}
}

@CommandHandler(UpdateBanUserForBlogCommand)
export class UpdateBanUserForBlogHandler
  implements ICommandHandler<UpdateBanUserForBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly bansRepositorySql: BansRepositorySql,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    createBanInput,
    userId,
    authUserId,
  }: UpdateBanUserForBlogCommand) {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    const blog = await this.blogsRepository.findOne(createBanInput.blogId);

    if (blog && blog.userId !== authUserId) {
      throw new ForbiddenException();
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
