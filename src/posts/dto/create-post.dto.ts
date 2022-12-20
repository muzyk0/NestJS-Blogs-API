import { IsNotEmpty, IsString, Length } from 'class-validator';

import { Blog } from '../../blogs/schemas/blogs.schema';

export class CreatePostDto {
  @IsString()
  @Length(1, 30)
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  shortDescription: string;

  @Length(1, 1000)
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  blogId: Blog['id'];
}
