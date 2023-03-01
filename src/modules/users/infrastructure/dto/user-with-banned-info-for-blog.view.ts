import { IsBoolean, IsDate, IsString } from 'class-validator';

import { User } from '../../domain/entities/user.entity';

export class UserWithBannedInfoForBlogView extends User {
  @IsBoolean()
  isBannedForBlog: boolean;

  @IsString()
  banReasonForBlog: string;

  @IsDate()
  updatedAtForBlog: string;
}
