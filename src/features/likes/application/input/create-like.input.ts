import { IsEnum } from 'class-validator';

import { LikeStringStatus } from '../interfaces/like-status.enum';

export class CreateLikeInput {
  @IsEnum(LikeStringStatus)
  likeStatus: LikeStringStatus;
}
