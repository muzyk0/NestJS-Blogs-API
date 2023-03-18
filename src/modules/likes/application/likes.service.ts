import { Injectable } from '@nestjs/common';

import { LikesRepositorySql } from '../infrastructure/likes.repository.sql';

import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepositorySql: LikesRepositorySql) {}

  async createOrUpdatePostLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepositorySql.createOrUpdatePostLikeStatus({
      postId: createLike.postId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }

  async updateCommentLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepositorySql.createOrUpdateCommentLikeStatus({
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
