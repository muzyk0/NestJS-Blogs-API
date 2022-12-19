import { IsEnum } from 'class-validator';

import { CommentLikeStringStatus } from '../interfaces/like-status.enum';

export class CreateLikeInput {
  @IsEnum(CommentLikeStringStatus)
  likeStatus: CommentLikeStringStatus;
}
