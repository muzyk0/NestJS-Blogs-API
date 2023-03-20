import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

import { IsBlogExists } from '../../../../shared/decorators/validations/check-blogId-if-exist.decorator';

export class CreatePostDto {
  @IsString()
  @Length(1, 30)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim?.())
  title: string;

  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim?.())
  shortDescription: string;

  @IsString()
  @Length(1, 1000)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim?.())
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsBlogExists()
  blogId: string;
}
