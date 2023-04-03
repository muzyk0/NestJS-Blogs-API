import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsForUserDto } from '../../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../../shared/paginator/page.dto';
import { IBlogsRepository } from '../../../blogs/application/interfaces/blog.abstract-class';
import { UserBloggerViewModel } from '../../../users/infrastructure/dto/user.view';
import { IUsersQueryRepository } from '../../../users/infrastructure/users.query.repository.sql';

export class GetAllBanUsersForBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly userId: string,
    public readonly pageOptionsForUserDto: PageOptionsForUserDto,
  ) {}
}

@CommandHandler(GetAllBanUsersForBlogCommand)
export class GetAllBanUsersForBlogHandler
  implements
    ICommandHandler<
      GetAllBanUsersForBlogCommand,
      PageDto<UserBloggerViewModel>
    >
{
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute({
    blogId,
    userId,
    pageOptionsForUserDto,
  }: GetAllBanUsersForBlogCommand): Promise<PageDto<UserBloggerViewModel>> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.usersQueryRepository.getBannedUsersForBlog(
      pageOptionsForUserDto,
      blogId,
    );
  }
}
