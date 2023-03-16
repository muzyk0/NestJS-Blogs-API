import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Like } from '../../domain/entity/like.entity';
import { LikeStatus } from '../interfaces/like-status.enum';

export class CreateLikeDto implements Partial<Like> {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  postId?: string;

  @IsString()
  @IsOptional()
  commentId?: string;

  @IsEnum(LikeStatus)
  @IsOptional()
  likeStatus: LikeStatus;
}
