import { CreatePostCommentHandler } from './create-post-comments.handler';
import { GetPostCommentsInsideCurrentUserBlogsHandler } from './get-post-comments-inside-current-user-blogs.handler';
import { GetPostCommentsHandler } from './get-post-comments.handler';
import { LikeCommentHandler } from './like-comment.handler';
import { RemoveCommentHandler } from './remove-comment.handler';
import { UpdateCommentHandler } from './update-comment.handler';

export const CommandHandlers = [
  GetPostCommentsHandler,
  GetPostCommentsInsideCurrentUserBlogsHandler,
  CreatePostCommentHandler,
  UpdateCommentHandler,
  RemoveCommentHandler,
  LikeCommentHandler,
];
