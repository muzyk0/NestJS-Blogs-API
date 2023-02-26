import { Blog } from '../domain/entities/blog.entity';

export interface BlogWithUserLogin extends Blog {
  userLogin: string;
}
