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

export interface CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
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
