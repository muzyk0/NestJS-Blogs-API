import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetCommentLikeDto } from './dto/get-comment-like.dto';
import { CommentLikeStatus } from './interfaces/comment-like-status.enum';
import { CommentLikeInterface } from './interfaces/comment-like.interface';
import { GetCommentLikeByUser } from './interfaces/get-comment-like.interface';
import {
  CommentLike,
  CommentLikeDocument,
} from './schemas/comment-likes.schema';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async countLikeAndDislikeByCommentId({ commentId }: GetCommentLikeDto) {
    const likesCount = await this.commentLikeModel
      .countDocuments({
        commentId,
        status: CommentLikeStatus.LIKE,
      })
      .lean();
    const dislikesCount = await this.commentLikeModel
      .countDocuments({
        commentId,
        status: CommentLikeStatus.DISLIKE,
      })
      .lean();

    return {
      likesCount,
      dislikesCount,
    };
  }

  async getLikeOrDislike({ commentId, userId }: GetCommentLikeByUser) {
    const likes = await this.commentLikeModel
      .find(
        {
          commentId,
          userId,
        },
        {},
        { sort: { createdAt: 'desc' } },
      )
      .limit(1)
      .lean();

    return likes[0];
  }

  async create(createLike: CommentLikeInterface) {
    await this.commentLikeModel.deleteMany({
      commentId: createLike.commentId,
      userId: createLike.userId,
    });

    return this.commentLikeModel.create(createLike);
  }
}
