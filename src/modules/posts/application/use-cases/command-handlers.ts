import { CreateBlogPostHandler } from './create-blog-post.handler';
import { DeleteBlogPostHandler } from './delete-blog-post.handler';
import { GetAllBanUsersForBlogHandler } from './get-all-banned-users-for-blog.handler';
import { LikePostHandler } from './like-post.handler';
import { UpdateBlogPostHandler } from './update-blog-post.handler';

export const CommandHandlers = [
  CreateBlogPostHandler,
  UpdateBlogPostHandler,
  DeleteBlogPostHandler,
  LikePostHandler,
  GetAllBanUsersForBlogHandler,
];
