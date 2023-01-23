import { IsInt, IsString } from 'class-validator';

export class LikeDto {
  @IsInt()
  likesCount: number;

  @IsInt()
  dislikesCount: number;

  @IsString()
  myStatus: string;
}
