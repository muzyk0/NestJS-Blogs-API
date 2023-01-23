import { IsEnum, IsOptional, IsString } from 'class-validator';

import { LikeParentTypeEnum } from '../interfaces/like-parent-type.enum';
import { LikeStatus } from '../interfaces/like-status.enum';

export class CreateLikeDto {
  @IsString()
  userId: string;

  @IsString()
  parentId: string;

  @IsEnum(LikeParentTypeEnum)
  parentType: LikeParentTypeEnum;

  @IsEnum(LikeStatus)
  @IsOptional()
  likeStatus: number;
}
