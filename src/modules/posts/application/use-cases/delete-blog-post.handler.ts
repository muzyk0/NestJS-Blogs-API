import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../../blogs/application/interfaces/blog.abstract-class';
import { IPostsRepository } from '../interfaces/posts-repository.abstract-class';

export class DeleteBlogPostCommand {
  constructor(
    public readonly postId: string,
    public readonly blogId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostHandler
  implements ICommandHandler<DeleteBlogPostCommand, void>
{
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({
    postId,
    blogId,
    userId,
  }: DeleteBlogPostCommand): Promise<void> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.postsRepository.remove(postId);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }
}
