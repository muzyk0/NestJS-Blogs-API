import { BlogDto } from '../application/dto/blog.dto';

export interface BlogRowSqlDto extends BlogDto {
  userLogin: string;
  banned: string;

  userId: string;
}
