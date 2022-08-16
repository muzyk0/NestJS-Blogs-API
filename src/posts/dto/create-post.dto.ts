import { IsNotEmpty, IsString, Length } from 'class-validator';

import { Blogger } from '../../bloggers/schemas/bloggers.schema';

export class CreatePostDto {
  @Length(1, 30)
  @IsNotEmpty()
  title: string;

  @Length(0, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  @IsString()
  bloggerId: Blogger['id'];
}
