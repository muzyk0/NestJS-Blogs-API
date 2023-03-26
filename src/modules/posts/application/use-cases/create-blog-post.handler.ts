import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogPostDto } from '../../../blogs/application/dto/create-blog-post.dto';
import { IBlogsRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { Post } from '../../domain/entities/post.entity';
import { IPostsRepository } from '../../infrastructure/posts.sql.repository';

export class CreateBlogPostCommand {
  constructor(
    public readonly blogId: string,
    public readonly userId: string,
    public readonly createBlogPostDto: CreateBlogPostDto,
  ) {}
}

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostHandler
  implements ICommandHandler<CreateBlogPostCommand, Post['id']>
{
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({
    userId,
    blogId,
    createBlogPostDto,
  }: CreateBlogPostCommand): Promise<Post['id']> {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException();
    }

    const { id: postId } = await this.postsRepository.create({
      blogId: blog.id,
      shortDescription: createBlogPostDto.shortDescription,
      content: createBlogPostDto.content,
      title: createBlogPostDto.title,
    });
    return postId;
  }
}
