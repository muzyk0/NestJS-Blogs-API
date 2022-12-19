import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CommentLikeStatus } from '../interfaces/like-status.enum';

export class CreateLikeDto {
  @IsString()
  userId: string;

  @IsString()
  commentId: string;

  @IsEnum(CommentLikeStatus)
  @IsOptional()
  likeStatus: number;
}
