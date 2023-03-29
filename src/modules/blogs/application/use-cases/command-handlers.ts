import { UpdateBanUserForBlogHandler } from '../../../bans/application/use-cases/update-ban-user-for-blog.handler';

import { BindBlogOnUserHandler } from './bind-blog-on-user.handler';
import { CreateBlogCommand, CreateBlogHandler } from './create-blog.handler';
import { GetBlogsForAdminHandler } from './get-blogs-for-admin.handler';
import { DeleteBlogHandler } from './remove-blog.handler';
import { UpdateBlogHandler } from './update-blog.handler';

export const CommandHandlers = [
  GetBlogsForAdminHandler,
  BindBlogOnUserHandler,
  UpdateBanUserForBlogHandler,
  CreateBlogCommand,
  UpdateBlogHandler,
  DeleteBlogHandler,
  CreateBlogHandler,
];
