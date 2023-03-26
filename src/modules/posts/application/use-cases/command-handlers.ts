import { CreateBlogPostHandler } from './create-blog-post.handler';
import { DeleteBlogPostHandler } from './delete-blog-post.handler';
import { UpdateBlogPostHandler } from './update-blog-post.handler';

export const CommandHandlers = [
  CreateBlogPostHandler,
  UpdateBlogPostHandler,
  DeleteBlogPostHandler,
];
