import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../interfaces/blog.abstract-class';

export class DeleteBlogCommand {
  constructor(public readonly blogId: string, public readonly userId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute({ blogId, userId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.blogsRepository.remove(blogId);

    return;
  }
}
