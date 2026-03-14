import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Order } from '../../constants';

export class BasePageOptionsDto {
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

  @ApiProperty({ type: 'string', required: false, default: 'createdAt' })
  @IsString()
  @IsOptional()
  readonly sortBy?: string = 'createdAt';

  @ApiProperty({
    type: 'enum',
    enum: Order,
    required: false,
    default: Order.DESC,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly sortDirection?: Order = Order.DESC;

  @ApiProperty({
    type: 'number',
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly pageNumber?: number = 1;

  @ApiProperty({
    type: 'number',
    required: false,
    default: 10,
  })
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

export class PageOptionsDto extends BasePageOptionsDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  searchNameTerm?: string | null = null;
}

export enum PublishQuizQuestionEnum {
  ALL = 'all',
  PUBLISHED = 'published',
  NOT_PUBLISHED = 'notPublished',
}

export class QuizPageOptionsDto extends BasePageOptionsDto {
  constructor() {
    super();
  }
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  bodySearchTerm?: string | null = null;

  @ApiProperty({
    type: 'enum',
    required: false,
    enum: PublishQuizQuestionEnum,
    default: PublishQuizQuestionEnum.ALL,
  })
  @IsString()
  @IsOptional()
  publishedStatus?: string | null = PublishQuizQuestionEnum.ALL;
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
