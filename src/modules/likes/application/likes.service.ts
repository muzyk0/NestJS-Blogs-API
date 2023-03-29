import { Injectable } from '@nestjs/common';

import { ILikesRepository } from '../infrastructure/likes.repository.sql';

import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: ILikesRepository) {}

  async createOrUpdatePostLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepository.createOrUpdatePostLikeStatus({
      postId: createLike.postId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }

  async updateCommentLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepository.createOrUpdateCommentLikeStatus({
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
