import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { Nullable } from '../../../../shared/interfaces/common-types';

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
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}

export class BlogView {
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  createdAt: string;

  isMembership: boolean;
}

export class BlogViewDtoForSuperAdmin extends BlogView {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: Nullable<string>;
  };
}
