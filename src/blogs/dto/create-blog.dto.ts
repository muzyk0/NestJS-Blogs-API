import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export const youtubeURLPattern =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+$/;

export class CreateBlogDto {
  @IsString()
  @Length(1, 15)
  @IsNotEmpty()
  name: string;

  @Length(0, 100)
  @Matches(youtubeURLPattern)
  youtubeUrl: string;
}
