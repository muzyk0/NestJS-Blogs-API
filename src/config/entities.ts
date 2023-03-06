import { RevokeToken } from '../modules/auth/domain/entities/revoked-token.entity';
import { Bans } from '../modules/bans/domain/entity/bans.entity';
import { BlogsBans } from '../modules/bans/domain/entity/blogger-bans.entity';
import { Blog } from '../modules/blogs/domain/entities/blog.entity';
import { Comment } from '../modules/comments/domain/entities/comment.entity';
import { Like } from '../modules/likes/domain/entity/like.entity';
import { Post } from '../modules/posts/domain/entities/post.entity';
import { Device } from '../modules/security/domain/entities/security.entity';
import { User } from '../modules/users/domain/entities/user.entity';

export const entities = [
  Like,
  BlogsBans,
  Bans,
  User,
  RevokeToken,
  Device,
  Blog,
  Post,
  Comment,
];
