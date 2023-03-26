import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { IPostsRepository } from '../../../posts/infrastructure/posts.sql.repository';
import { ICommentsQueryRepository } from '../../infrastructure/comments.query.sql.repository';

export class GetPostCommentsCommand {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto,
    public readonly postId: string,
    public readonly userId?: string,
  ) {}
}

@CommandHandler(GetPostCommentsCommand)
export class GetPostCommentsHandler
  implements ICommandHandler<GetPostCommentsCommand>
{
  constructor(
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({ pageOptionsDto, postId, userId }: GetPostCommentsCommand) {
    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException({
        field: '',
        message: "Post doesn't exist",
      });
    }

    return this.commentsQueryRepository.findPostComments(pageOptionsDto, {
      postId: postId,
      userId: userId,
    });
  }
}
