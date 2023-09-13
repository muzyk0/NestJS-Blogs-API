import { LikeStatus } from './like-status.enum';

export interface LikeInterface {
  userId: string;
  commentId?: string;
  postId?: string;
  status: LikeStatus;
}
