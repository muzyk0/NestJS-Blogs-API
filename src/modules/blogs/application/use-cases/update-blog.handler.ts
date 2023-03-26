import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../infrastructure/blogs.sql.repository';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export class UpdateBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly userId: string,
    public readonly updateBlogDto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute({
    updateBlogDto,
    blogId,
    userId,
  }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.blogsRepository.update(blogId, updateBlogDto);

    return;
  }
}
