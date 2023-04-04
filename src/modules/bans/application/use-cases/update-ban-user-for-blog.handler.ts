import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../../blogs/application/interfaces/blog.abstract-class';
import { BanUserForBlogInput } from '../../../blogs/controllers/dto/ban-user-for-blog.input';
import { IUsersRepository } from '../../../users/application/application/users-repository.abstract-class';
import { CreateBanInput } from '../input/create-ban.input';
import { IBloggersBanUsersRepository } from '../interfaces/bloggers-ban-users.abstract-class';

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
    private readonly blogsRepository: IBlogsRepository,
    private readonly bansRepositorySql: IBloggersBanUsersRepository,
    private readonly usersRepository: IUsersRepository,
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
      blogId: createBanInput.blogId,
    };
    return this.bansRepositorySql.updateOrCreateBan(updateBan);
  }
}
