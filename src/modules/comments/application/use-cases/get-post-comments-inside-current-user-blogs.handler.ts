import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { IBlogsRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { IPostsRepository } from '../../../posts/infrastructure/posts.sql.repository';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';

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
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({
    pageOptionsDto,
    userId,
  }: GetPostCommentsInsideCurrentUserBlogsCommand) {
    const blogsIds = await this.blogsRepository
      .findByUserId(userId)
      .then((res) => res.map((b) => b.id));

    const posts = await this.postsRepository.findManyByBlogsIds(blogsIds);
    return this.commentsQueryRepository.findPostCommentsInsideUserBlogs(
      pageOptionsDto,
      posts,
    );
  }
}
