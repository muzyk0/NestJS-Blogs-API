import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class BanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogHandler implements ICommandHandler<BanBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ blogId, isBanned }: BanBlogCommand) {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new BadRequestException();
    }
    const banDate = isBanned ? new Date() : null;
    return this.blogsRepository.updateBanStatus(blogId, isBanned, banDate);
  }
}
