import {
  LikeStatus,
  CommentLikeStringStatus,
} from './interfaces/like-status.enum';

export const stringLikeStatuses = {
  [LikeStatus.LIKE]: 'Like',
  [LikeStatus.DISLIKE]: 'Dislike',
  [LikeStatus.NONE]: 'None',
};

export const intLikeStatuses = {
  [CommentLikeStringStatus.LIKE]: LikeStatus.LIKE,
  [CommentLikeStringStatus.DISLIKE]: LikeStatus.DISLIKE,
  [CommentLikeStringStatus.NONE]: LikeStatus.NONE,
};
