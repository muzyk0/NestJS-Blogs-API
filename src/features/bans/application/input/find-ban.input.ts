import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { BanTypeEnum } from '../interfaces/ban-type.enum';

export class FindBanInput {
  @IsString()
  userId: string;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsEnum(BanTypeEnum)
  type: BanTypeEnum;
}

export class FindBanByBlogIdInput {
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsEnum(BanTypeEnum)
  type: BanTypeEnum;
}
