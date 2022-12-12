import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { CommentLikesRepository } from './comment-likes.repository';
import { CreateCommentLikeDto } from './dto/create-comment-like.dto';
import { CommentLikeStatus } from './interfaces/comment-like-status.enum';
import { GetCommentLikeByUser } from './interfaces/get-comment-like.interface';

@Injectable()
export class CommentLikesService {
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async getLikeOrDislike(getCommentLikeDto: GetCommentLikeByUser) {
    return this.commentLikesRepository.getLikeOrDislike(getCommentLikeDto);
  }

  async createLike(createLike: CreateCommentLikeDto) {
    return this.commentLikesRepository.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: CommentLikeStatus.LIKE,
    });
  }

  async updateLikeStatus(createLike: CreateCommentLikeDto) {
    return this.commentLikesRepository.create({
      id: v4(),
      commentId: createLike.commentId,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
