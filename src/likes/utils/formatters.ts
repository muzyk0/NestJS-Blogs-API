import { intLikeStatuses, stringLikeStatuses } from '../constants';
import { Like } from '../entity/like.entity';
import {
  LikeStatus,
  CommentLikeStringStatus,
} from '../interfaces/like-status.enum';

export const getStringLikeStatus = (like: Like | null) => {
  return (
    stringLikeStatuses[like?.status] ?? stringLikeStatuses[LikeStatus.NONE]
  );
};

export const formatLikeStatusToInt = (
  likeStatus: CommentLikeStringStatus,
): LikeStatus | null => {
  return (
    intLikeStatuses[likeStatus] ?? intLikeStatuses[CommentLikeStringStatus.NONE]
  );
};
