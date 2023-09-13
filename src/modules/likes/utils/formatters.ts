import {
  LikeStatus,
  LikeStringStatus,
} from '../application/interfaces/like-status.enum';
import { intLikeStatuses, stringLikeStatuses } from '../constants';

export const getStringLikeStatus = (status: LikeStatus): LikeStringStatus => {
  return stringLikeStatuses[status] ?? stringLikeStatuses[LikeStatus.NONE];
};

export const formatLikeStatusToInt = (
  likeStatus: LikeStringStatus,
): LikeStatus => {
  return intLikeStatuses[likeStatus] ?? intLikeStatuses[LikeStringStatus.NONE];
};
