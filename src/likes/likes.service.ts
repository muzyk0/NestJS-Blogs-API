import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { CreateLikeDto } from './dto/create-like.dto';
import { GetCommentLikeByUser } from './interfaces/get-like.interface';
import { CommentLikeStatus } from './interfaces/like-status.enum';
import { LikesRepository } from './likes.repository';
import { LikesRepositorySql } from './likes.repository.sql';

@Injectable()
export class LikesService {
  constructor(
    private readonly commentLikesRepository: LikesRepository,
    private readonly commentLikesRepositorySql: LikesRepositorySql,
  ) {}

  async getLikeOrDislike(getCommentLikeDto: GetCommentLikeByUser) {
    return this.commentLikesRepositorySql.getLikeOrDislike(getCommentLikeDto);
  }

  async createLike(createLike: CreateLikeDto) {
    return this.commentLikesRepositorySql.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: CommentLikeStatus.LIKE,
    });
  }

  async updateLikeStatus(createLike: CreateLikeDto) {
    return this.commentLikesRepositorySql.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
