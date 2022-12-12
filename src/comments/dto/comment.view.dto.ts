import { IsArray, IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

import { CommentLikeDto } from '../../comment-likes/dto/comment-like.dto';

export interface IComment {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  postId: string;
}

export class CommentViewDto implements IComment {
  @IsString()
  id: string;

  @Length(20, 300)
  @IsNotEmpty()
  content: string;

  @IsString()
  userId: string;

  @IsString()
  userLogin: string;

  @IsString()
  postId: string;

  @IsDate()
  createdAt: Date;

  @IsArray()
  likesInfo: CommentLikeDto;
}
