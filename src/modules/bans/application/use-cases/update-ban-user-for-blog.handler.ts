import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BanUserForBlogInput } from '../../../blogs/controllers/dto/ban-user-for-blog.input';
import { IBlogsRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { IUsersRepository } from '../../../users/infrastructure/users.repository.sql';
import { IBloggersBanUsersRepository } from '../../infrastructure/bloggers-ban-users-repository.service';
import { CreateBanInput } from '../input/create-ban.input';

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
