import { Injectable } from '@nestjs/common';

import { LikesRepositorySql } from '../infrastructure/likes.repository.sql';

import { CreateLikeDto } from './dto/create-like.dto';
import { GetCommentLikeByUser } from './interfaces/get-like.interface';
import { LikeStatus } from './interfaces/like-status.enum';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepositorySql: LikesRepositorySql) {}

  async getLikeOrDislike(getCommentLikeDto: GetCommentLikeByUser) {
    return this.likesRepositorySql.getLikeOrDislike(getCommentLikeDto);
  }

  async createLike(createLike: CreateLikeDto) {
    return this.likesRepositorySql.create({
      parentId: createLike.parentId,
      parentType: createLike.parentType,
      userId: createLike.userId,
      status: LikeStatus.LIKE,
    });
  }

  async updateLikeStatus(createLike: CreateLikeDto) {
    return this.likesRepositorySql.create({
      parentId: createLike.parentId,
      parentType: createLike.parentType,
      userId: createLike.userId,
      status: createLike.likeStatus,
    });
  }
}
