import { CreatePostCommentHandler } from './create-post-comments.handler';
import { GetPostCommentsInsideCurrentUserBlogsHandler } from './get-post-comments-inside-current-user-blogs.handler';
import { GetPostCommentsHandler } from './get-post-comments.handler';

export const CommandHandlers = [
  GetPostCommentsHandler,
  GetPostCommentsInsideCurrentUserBlogsHandler,
  CreatePostCommentHandler,
];
