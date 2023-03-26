import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { IPostsRepository } from '../../infrastructure/posts.sql.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

export class UpdateBlogPostCommand {
  constructor(
    public readonly postId: string,
    public readonly blogId: string,
    public readonly userId: string,
    public readonly updatePostDto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostHandler
  implements ICommandHandler<UpdateBlogPostCommand, void>
{
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({
    postId,
    blogId,
    userId,
    updatePostDto,
  }: UpdateBlogPostCommand): Promise<void> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }

    const post = await this.postsRepository.update(postId, updatePostDto);

    if (!post) {
      throw new NotFoundException();
    }
    return;
  }
}
