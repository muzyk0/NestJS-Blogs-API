import { BlogDto } from '../application/dto/blog.dto';

export interface BlogRawSqlDto extends BlogDto {
  userLogin: string;
  banned: string;

  userId: string;
}
