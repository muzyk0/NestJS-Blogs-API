import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
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
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
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
