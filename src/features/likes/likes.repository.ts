import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetLikeDto } from './dto/get-like.dto';
import { GetCommentLikeByUser } from './interfaces/get-like.interface';
import { LikeStatus } from './interfaces/like-status.enum';
import { LikeInterface } from './interfaces/like.interface';
import {
  CommentLike,
  CommentLikeDocument,
} from './schemas/comment-likes.schema';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async countLikeAndDislikeByCommentId({ parentId }: GetLikeDto) {
    const likesCount = await this.commentLikeModel
      .countDocuments({
        parentId: parentId,
        status: LikeStatus.LIKE,
      })
      .lean();
    const dislikesCount = await this.commentLikeModel
      .countDocuments({
        parentId: parentId,
        status: LikeStatus.DISLIKE,
      })
      .lean();

    return {
      likesCount,
      dislikesCount,
    };
  }

  async getLikeOrDislike({ parentId, userId }: GetCommentLikeByUser) {
    const likes = await this.commentLikeModel
      .find(
        {
          parentId: parentId,
          userId,
        },
        {},
        { sort: { createdAt: 'desc' } },
      )
      .limit(1)
      .lean();

    return likes[0];
  }

  async create(createLike: LikeInterface) {
    await this.commentLikeModel.deleteMany({
      parentId: createLike.parentId,
      userId: createLike.userId,
    });

    return this.commentLikeModel.create(createLike);
  }
}
