import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeInterface } from '../application/interfaces/like.interface';
import { ILikesRepository } from '../application/interfaces/likes-repository.abstract-class';
import { Like } from '../domain/entity/like.entity';

@Injectable()
export class LikesRepository implements ILikesRepository {
  constructor(
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
  ) {}

  async createOrUpdatePostLikeStatus(
    createLike: Omit<LikeInterface, 'commentId'>,
  ): Promise<Like | null> {
    const like = await this.likeRepository.findOne({
      where: { userId: createLike.userId, postId: createLike.postId },
    });

    if (like) {
      like.status = createLike.status;

      return this.likeRepository.save(like);
    }

    const createdLike = await this.likeRepository.create({
      userId: createLike.userId,
      postId: createLike.postId,
      status: createLike.status,
    });

    return this.likeRepository.create(createdLike);
  }

  async createOrUpdateCommentLikeStatus(
    createLike: Omit<LikeInterface, 'postId'>,
  ): Promise<Like | null> {
    const like = await this.likeRepository.findOne({
      where: { userId: createLike.userId, commentId: createLike.commentId },
    });

    if (like) {
      like.status = createLike.status;

      return this.likeRepository.save(like);
    }

    const createdLike = await this.likeRepository.create({
      userId: createLike.userId,
      commentId: createLike.commentId,
      status: createLike.status,
    });

    return this.likeRepository.create(createdLike);
  }
}
