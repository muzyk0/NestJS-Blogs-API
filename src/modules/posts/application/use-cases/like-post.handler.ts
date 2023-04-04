import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IBlogsRepository } from '../../../blogs/application/interfaces/blog.abstract-class';
import { CreateLikeInput } from '../../../likes/application/input/create-like.input';
import { LikeStringStatus } from '../../../likes/application/interfaces/like-status.enum';
import { ILikesRepository } from '../../../likes/application/interfaces/likes-repository.abstract-class';
import { formatLikeStatusToInt } from '../../../likes/utils/formatters';
import { IPostsRepository } from '../../infrastructure/posts.sql.repository';

export class LikePostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly createLikeInput: CreateLikeInput,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostHandler implements ICommandHandler<LikePostCommand, void> {
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly likesRepositorySql: ILikesRepository,
  ) {}

  async execute({
    postId,
    userId,
    createLikeInput,
  }: LikePostCommand): Promise<void> {
    const comment = await this.createOrUpdatePostLikeStatus({
      postId,
      userId,
      likeStatus: createLikeInput.likeStatus,
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return;
  }

  private async createOrUpdatePostLikeStatus(updateLike: {
    postId: string;
    userId: string;
    likeStatus: LikeStringStatus;
  }) {
    const post = await this.postsRepository.findOne(updateLike.postId);

    if (!post) {
      throw new NotFoundException();
    }

    const status = formatLikeStatusToInt(updateLike.likeStatus);

    return this.likesRepositorySql.createOrUpdatePostLikeStatus({
      postId: updateLike.postId,
      userId: updateLike.userId,
      status,
    });
  }
}
