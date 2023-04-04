import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../../blogs/application/interfaces/blog.abstract-class';

export class BanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogHandler implements ICommandHandler<BanBlogCommand> {
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute({ blogId, isBanned }: BanBlogCommand) {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new BadRequestException();
    }
    return this.blogsRepository.updateBanStatus(blogId, isBanned);
  }
}
