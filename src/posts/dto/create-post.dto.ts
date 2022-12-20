import { IsNotEmpty, IsString, Length } from 'class-validator';

import { Blog } from '../../blogs/schemas/blogs.schema';
import { IsBlogExists } from '../../common/decorators/validations/check-blogId-if-exist.decorator';

export class CreatePostDto {
  @IsString()
  @Length(1, 30)
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @Length(1, 1000)
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsBlogExists()
  blogId: Blog['id'];
}
