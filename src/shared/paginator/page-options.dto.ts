import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Order } from '../../constants';

export class PageOptionsDto {
  constructor() {
    Object.defineProperty(this, 'skip', {
      get() {
        return (this.pageNumber - 1) * this.pageSize;
      },
      set(_val: string) {
        throw Error(`Property "skip" are only getter. Don't set value ${_val}`);
      },
    });
  }

  @IsString()
  @IsOptional()
  readonly sortBy?: string = 'createdAt';

  @IsEnum(Order)
  @IsOptional()
  readonly sortDirection?: Order = Order.DESC;

  @IsString()
  @IsOptional()
  searchNameTerm?: string | null = null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly pageNumber?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly pageSize?: number = 10;

  /**
   * Property "skip" are only getter. Don\'t set value
   */
  skip?: number = 0;
  // get skip() {
  //   return (this.PageNumber - 1) * this.PageSize;
  // }
}

export enum UserBanStatus {
  ALL = 'all',
  BANNED = 'banned',
  NOT_BANNED = 'notBanned',
}

export class PageOptionsForUserDto extends PageOptionsDto {
  @IsString()
  @IsOptional()
  searchLoginTerm?: string | null = null;

  @IsString()
  @IsOptional()
  searchEmailTerm?: string | null = null;

  @IsEnum(UserBanStatus)
  @IsOptional()
  banStatus?: string | null = null;
}
