import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePostDbDto {
  @Length(1, 30)
  @IsNotEmpty()
  title: string;

  @Length(0, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  @IsString()
  blogId: string;
}
