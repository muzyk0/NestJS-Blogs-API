import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

import { IsBlogExists } from '../../../../shared/decorators/validations/check-blogId-if-exist.decorator';

export class BanUserForBlogInput {
  @IsString()
  @IsNotEmpty()
  @IsBlogExists()
  blogId: string;

  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Length(20)
  banReason: string;
}
