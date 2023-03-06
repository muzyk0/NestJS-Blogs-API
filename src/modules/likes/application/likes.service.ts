import { Injectable } from '@nestjs/common';

import { LikesRepositorySql } from '../infrastructure/likes.repository.sql';

import { CreateLikeDto } from './dto/create-like.dto';
import { GetCommentLikeByUser } from './interfaces/get-like.interface';
import { LikeStatus } from './interfaces/like-status.enum';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepositorySql: LikesRepositorySql) {}

  async updatePostLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepositorySql.create({
      postId: createLike.postId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }

  async updateCommentLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepositorySql.create({
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
