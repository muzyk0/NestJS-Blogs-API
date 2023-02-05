import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export const websiteURLPattern =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+$/;

export class CreateBlogDto {
  @IsString()
  @Length(1, 15)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim?.())
  name: string;

  @Length(0, 500)
  @Transform(({ value }) => value?.trim?.())
  description: string;

  @Length(0, 100)
  @Matches(websiteURLPattern)
  websiteUrl: string;

  @IsString()
  userId: string;
}
