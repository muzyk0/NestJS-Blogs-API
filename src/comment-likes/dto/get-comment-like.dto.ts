import { IsString } from 'class-validator';

export class GetCommentLikeDto {
  @IsString()
  commentId: string;
}
