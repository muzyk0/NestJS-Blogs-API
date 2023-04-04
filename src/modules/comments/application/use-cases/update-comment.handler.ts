import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IPostsRepository } from '../../../posts/application/interfaces/posts-repository.abstract-class';
import { ICommentsQueryRepository } from '../../controllers/interfaces/comments-query-repository.abstract-class';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentInput } from '../dto/comment.input';
import { ICommentsRepository } from '../interfaces/comment-repository.abstract-class';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly updateCommentDto: CommentInput,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand, Comment>
{
  constructor(
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async execute({
    commentId,
    userId,
    updateCommentDto,
  }: UpdateCommentCommand): Promise<Comment> {
    const commentIsExist = await this.commentsRepository.findOne(commentId);

    if (!commentIsExist) {
      throw new NotFoundException();
    }

    if (commentIsExist.userId !== userId) {
      throw new ForbiddenException();
    }

    const updatedComment = await this.commentsRepository.update(
      commentId,
      updateCommentDto,
    );

    return updatedComment;
  }
}
