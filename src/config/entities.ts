import { RevokeToken } from '../modules/auth/domain/entities/revoked-token.entity';
import { Ban } from '../modules/bans/domain/entity/ban.entity';
import { Blog } from '../modules/blogs/domain/entities/blog.entity';
import { Like } from '../modules/likes/domain/entity/like.entity';
import { Post } from '../modules/posts/domain/entities/post.entity';
import { Device } from '../modules/security/domain/entities/security.entity';
import { User } from '../modules/users/domain/entities/user.entity';

export const entities = [Like, Ban, User, RevokeToken, Device, Blog, Post];

console.log(Blog);
