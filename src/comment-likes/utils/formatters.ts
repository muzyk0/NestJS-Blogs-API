import { intLikeStatuses, stringLikeStatuses } from '../constants';
import {
  CommentLikeStatus,
  CommentLikeStringStatus,
} from '../interfaces/comment-like-status.enum';
import { CommentLikeType } from '../schemas/comment-likes.schema';

export const getCommentStringLikeStatus = (like: CommentLikeType | null) => {
  return stringLikeStatuses[like?.status] ?? stringLikeStatuses['default'];
};

export const formatLikeStatusToInt = (
  likeStatus: CommentLikeStringStatus,
): CommentLikeStatus | null => {
  return intLikeStatuses[likeStatus] ?? null;
};
