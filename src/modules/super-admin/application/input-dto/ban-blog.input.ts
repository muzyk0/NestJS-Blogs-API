import { IsBoolean } from 'class-validator';

export class BanBlogInput {
  @IsBoolean()
  isBanned: boolean;
}
