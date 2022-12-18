import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { CommentLikesRepository } from './comment-likes.repository';
import { CommentLikesRepositorySql } from './comment-likes.repository.sql';
import { CreateCommentLikeDto } from './dto/create-comment-like.dto';
import { CommentLikeStatus } from './interfaces/comment-like-status.enum';
import { GetCommentLikeByUser } from './interfaces/get-comment-like.interface';

@Injectable()
export class CommentLikesService {
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentLikesRepositorySql: CommentLikesRepositorySql,
  ) {}

  async getLikeOrDislike(getCommentLikeDto: GetCommentLikeByUser) {
    return this.commentLikesRepositorySql.getLikeOrDislike(getCommentLikeDto);
  }

  async createLike(createLike: CreateCommentLikeDto) {
    return this.commentLikesRepositorySql.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: CommentLikeStatus.LIKE,
    });
  }

  async updateLikeStatus(createLike: CreateCommentLikeDto) {
    return this.commentLikesRepositorySql.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
