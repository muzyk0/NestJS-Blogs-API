import { LikeStringStatus } from '../../../likes/application/interfaces/like-status.enum';

export interface PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStringStatus;
    newestLikes: NewestLike[];
  };
}

interface NewestLike {
  addedAt: string;
  userId: string;
  login: string;
}
