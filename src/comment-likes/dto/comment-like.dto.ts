import { IsInt, IsString } from 'class-validator';

export class CommentLikeDto {
  @IsInt()
  likesCount: number;

  @IsInt()
  dislikesCount: number;

  @IsString()
  myStatus: string;
}
