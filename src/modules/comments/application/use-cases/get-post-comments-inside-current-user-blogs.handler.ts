import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { IBlogsRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { IPostsRepository } from '../../../posts/infrastructure/posts.sql.repository';
import { ICommentsQueryRepository } from '../../infrastructure/comments.query.sql.repository';

export class GetPostCommentsInsideCurrentUserBlogsCommand {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(GetPostCommentsInsideCurrentUserBlogsCommand)
export class GetPostCommentsInsideCurrentUserBlogsHandler
  implements ICommandHandler<GetPostCommentsInsideCurrentUserBlogsCommand>
{
  constructor(
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({
    pageOptionsDto,
    userId,
  }: GetPostCommentsInsideCurrentUserBlogsCommand) {
    return this.commentsQueryRepository.findPostCommentsInsideUserBlogs(
      pageOptionsDto,
      userId,
    );
  }
}
