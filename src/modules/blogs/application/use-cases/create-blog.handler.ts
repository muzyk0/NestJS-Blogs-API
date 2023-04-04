import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Blog } from '../../domain/entities/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { IBlogsRepository } from '../interfaces/blog.abstract-class';

export class CreateBlogCommand {
  constructor(public readonly createBlogDto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler
  implements ICommandHandler<CreateBlogCommand, Blog['id']>
{
  constructor(private readonly blogsRepository: IBlogsRepository) {}

  async execute({ createBlogDto }: CreateBlogCommand): Promise<Blog['id']> {
    const newBlog: CreateBlogDto = {
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      userId: createBlogDto.userId,
    };
    const blog = await this.blogsRepository.create(newBlog);

    return blog.id;
  }
}
