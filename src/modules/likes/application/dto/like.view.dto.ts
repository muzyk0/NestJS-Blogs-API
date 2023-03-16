import { IsInt, IsString } from 'class-validator';

import { LikeStringStatus } from '../interfaces/like-status.enum';

export class LikeViewDto {
  @IsInt()
  likesCount: number;

  @IsInt()
  dislikesCount: number;

  @IsString()
  myStatus: LikeStringStatus;
}
