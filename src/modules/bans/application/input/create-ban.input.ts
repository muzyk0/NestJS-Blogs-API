import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

import { IsBlogExists } from '../../../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExist } from '../../../../shared/decorators/validations/check-is-user-exist.decorator';

export class CreateBanInput {
  @IsString()
  @IsUserAlreadyExist()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsBlogExists()
  blogId: string;

  @IsBoolean()
  isBanned: boolean;

  @IsString()
  banReason: string;
}
