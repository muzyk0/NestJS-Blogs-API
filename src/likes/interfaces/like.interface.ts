import { CommentLikeStatus } from './like-status.enum';

export type LikeInterface = {
  id: string;
  userId: string;
  commentId: string;
  status: CommentLikeStatus | null;
};
