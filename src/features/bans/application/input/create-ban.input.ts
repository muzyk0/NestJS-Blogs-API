import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { BanTypeEnum } from '../interfaces/ban-type.enum';

export class CreateBanInput {
  @IsString()
  userId: string;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsEnum(BanTypeEnum)
  type: BanTypeEnum;

  @IsBoolean()
  isBanned: boolean;

  @IsString()
  banReason: string;
}
