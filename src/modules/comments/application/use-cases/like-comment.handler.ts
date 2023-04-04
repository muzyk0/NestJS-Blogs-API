import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateLikeInput } from '../../../likes/application/input/create-like.input';
import { ILikesRepository } from '../../../likes/application/interfaces/likes-repository.abstract-class';
import { formatLikeStatusToInt } from '../../../likes/utils/formatters';
import { ICommentsRepository } from '../interfaces/comment-repository.abstract-class';

export class LikeCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly createLikeInput: CreateLikeInput,
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentHandler
  implements ICommandHandler<LikeCommentCommand, void>
{
  constructor(
    private readonly commentsRepository: ICommentsRepository,
    private readonly likesRepository: ILikesRepository,
  ) {}

  async execute({
    commentId,
    userId,
    createLikeInput,
  }: LikeCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException();
    }

    const status = formatLikeStatusToInt(createLikeInput.likeStatus);

    await this.likesRepository.createOrUpdateCommentLikeStatus({
      commentId: commentId,
      userId: userId,
      status: status,
    });

    return;
  }
}
