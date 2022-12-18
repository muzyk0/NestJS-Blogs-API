import { IsEnum } from 'class-validator';

import { CommentLikeStringStatus } from '../interfaces/comment-like-status.enum';

export class CreateCommentLikeInput {
  @IsEnum(CommentLikeStringStatus)
  likeStatus: CommentLikeStringStatus;
}
