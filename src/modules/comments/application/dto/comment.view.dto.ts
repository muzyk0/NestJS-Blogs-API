import { IsArray, IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

import { LikeViewDto } from '../../../likes/application/dto/like.view.dto';
import { LikeInputDto } from '../../../likes/application/dto/likeInputDto';
import { LikeStringStatus } from '../../../likes/application/interfaces/like-status.enum';

export interface IComment {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  postId: string;
}

export interface CommentInputViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikeInputDto;
}

export interface CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikeViewDto;
}

export interface CommentForBloggerViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
  likesInfo: LikeViewDto;
}
