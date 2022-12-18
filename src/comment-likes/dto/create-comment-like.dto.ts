import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CommentLikeStatus } from '../interfaces/comment-like-status.enum';

export class CreateCommentLikeDto {
  @IsString()
  userId: string;

  @IsString()
  commentId: string;

  @IsEnum(CommentLikeStatus)
  @IsOptional()
  likeStatus: number;
}
