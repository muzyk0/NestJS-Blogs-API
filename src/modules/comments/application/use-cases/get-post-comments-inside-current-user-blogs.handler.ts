import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
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
