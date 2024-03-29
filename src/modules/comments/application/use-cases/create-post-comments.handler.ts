import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IPostsRepository } from '../../../posts/application/interfaces/posts-repository.abstract-class';
import { ICommentsQueryRepository } from '../../controllers/interfaces/comments-query-repository.abstract-class';
import { CommentInput } from '../dto/comment.input';
import { ICommentsRepository } from '../interfaces/comment-repository.abstract-class';

export class CreatePostCommentCommand {
  constructor(
    public readonly createCommentDto: CommentInput,
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentHandler
  implements ICommandHandler<CreatePostCommentCommand>
{
  constructor(
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async execute({
    createCommentDto,
    postId,
    userId,
  }: CreatePostCommentCommand) {
    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException();
    }

    const createdComment = await this.commentsRepository.create({
      postId: postId,
      content: createCommentDto.content,
      userId,
    });

    if (!createdComment) {
      throw new ForbiddenException({
        field: '',
        message: 'You are banned for this blog',
      });
    }

    const comment = await this.commentsQueryRepository.findOne(
      createdComment.id,
      userId,
    );

    if (!comment) {
      throw new BadRequestException({
        field: '',
        message: "Comment doesn't created",
      });
    }

    return comment;
  }
}
