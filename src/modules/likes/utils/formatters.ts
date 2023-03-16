import {
  LikeStatus,
  LikeStringStatus,
} from '../application/interfaces/like-status.enum';
import { intLikeStatuses, stringLikeStatuses } from '../constants';
import { Like } from '../domain/entity/like.entity';

export const getStringLikeStatus = (status: LikeStatus): LikeStringStatus => {
  return stringLikeStatuses[status] ?? stringLikeStatuses[LikeStatus.NONE];
};

export const formatLikeStatusToInt = (
  likeStatus: LikeStringStatus,
): LikeStatus | null => {
  return intLikeStatuses[likeStatus] ?? intLikeStatuses[LikeStringStatus.NONE];
};
