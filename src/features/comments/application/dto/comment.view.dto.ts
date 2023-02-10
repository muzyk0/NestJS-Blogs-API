import { IsArray, IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

import { LikeDto } from '../../../likes/application/dto/like.dto';

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
  likesInfo: LikeDto;
}

export interface CommentForBloggerViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
  likesInfo: LikeDto;
}
