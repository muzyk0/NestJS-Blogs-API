import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Order } from '../../constants';

export class PageOptionsDto {
  constructor() {
    Object.defineProperty(this, 'val', {
      get() {
        return (this.PageNumber - 1) * this.PageSize;
      },
      set(_val: string) {
        throw Error('Property "skip" are only getter. Don\'t set value');
      },
    });
  }

  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @IsString()
  @IsOptional()
  SearchNameTerm?: string | null = null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly PageNumber?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly PageSize?: number = 10;

  /**
   * Property "skip" are only getter. Don\'t set value
   */
  skip?: number;
}
