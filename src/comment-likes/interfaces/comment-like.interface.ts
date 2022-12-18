import { CommentLikeStatus } from './comment-like-status.enum';

export type CommentLikeInterface = {
  id: string;
  userId: string;
  commentId: string;
  status: CommentLikeStatus | null;
};
