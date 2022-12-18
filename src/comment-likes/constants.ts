import {
  CommentLikeStatus,
  CommentLikeStringStatus,
} from './interfaces/comment-like-status.enum';

export const stringLikeStatuses = {
  [CommentLikeStatus.LIKE]: 'Like',
  [CommentLikeStatus.DISLIKE]: 'Dislike',
  [CommentLikeStatus.NONE]: 'None',
};

export const intLikeStatuses = {
  [CommentLikeStringStatus.LIKE]: CommentLikeStatus.LIKE,
  [CommentLikeStringStatus.DISLIKE]: CommentLikeStatus.DISLIKE,
  [CommentLikeStringStatus.NONE]: CommentLikeStatus.NONE,
};
