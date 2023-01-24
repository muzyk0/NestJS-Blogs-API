import {
  LikeStatus,
  LikeStringStatus,
} from './application/interfaces/like-status.enum';

export const stringLikeStatuses = {
  [LikeStatus.LIKE]: 'Like',
  [LikeStatus.DISLIKE]: 'Dislike',
  [LikeStatus.NONE]: 'None',
};

export const intLikeStatuses = {
  [LikeStringStatus.LIKE]: LikeStatus.LIKE,
  [LikeStringStatus.DISLIKE]: LikeStatus.DISLIKE,
  [LikeStringStatus.NONE]: LikeStatus.NONE,
};
