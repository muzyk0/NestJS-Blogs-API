import {
  LikeStatus,
  LikeStringStatus,
} from './application/interfaces/like-status.enum';

export const stringLikeStatuses: Record<LikeStatus, LikeStringStatus> = {
  [LikeStatus.LIKE]: LikeStringStatus.LIKE,
  [LikeStatus.DISLIKE]: LikeStringStatus.DISLIKE,
  [LikeStatus.NONE]: LikeStringStatus.NONE,
};

export const intLikeStatuses = {
  [LikeStringStatus.LIKE]: LikeStatus.LIKE,
  [LikeStringStatus.DISLIKE]: LikeStatus.DISLIKE,
  [LikeStringStatus.NONE]: LikeStatus.NONE,
};
