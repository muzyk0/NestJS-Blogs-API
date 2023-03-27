import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ICommentsRepository } from '../interfaces/comment-repository.abstract-class';

export class RemoveCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentHandler
  implements ICommandHandler<RemoveCommentCommand, void>
{
  constructor(private readonly commentsRepository: ICommentsRepository) {}

  async execute({ commentId, userId }: RemoveCommentCommand): Promise<void> {
    const commentIsExist = await this.commentsRepository.findOne(commentId);

    if (!commentIsExist) {
      throw new NotFoundException();
    }

    if (commentIsExist.userId !== userId) {
      throw new ForbiddenException();
    }

    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException();
    }

    const isDeleted = await this.commentsRepository.remove(commentId);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return;
  }
}
