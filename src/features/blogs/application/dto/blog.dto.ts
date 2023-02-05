import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { websiteURLPattern } from './create-blog.dto';

export class BlogDto {
  @IsString()
  id: string;

  @IsString()
  @Length(1, 15)
  @IsNotEmpty()
  name: string;

  @Length(0, 500)
  description: string;

  @Length(0, 100)
  @Matches(websiteURLPattern)
  websiteUrl: string;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class BlogView {
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  createdAt?: Date;

  updatedAt?: Date;

  isMembership: boolean;
}

export class BlogDtoForSuperAdmin extends BlogView {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
}
