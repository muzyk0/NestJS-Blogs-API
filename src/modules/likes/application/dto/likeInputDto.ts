import { IsInt, IsString } from 'class-validator';

import { LikeStatus } from '../interfaces/like-status.enum';

export class LikeInputDto {
  @IsInt()
  likesCount: number;

  @IsInt()
  dislikesCount: number;

  @IsString()
  myStatus: LikeStatus;
}
