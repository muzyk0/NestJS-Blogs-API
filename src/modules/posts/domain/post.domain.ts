import { IsNotEmpty, IsString, Length } from 'class-validator';

import { BaseEntityDto } from '../../../shared/base-entity/base.entity.dto';
import { Blog } from '../../blogs/domain/entities/blog.entity';

export class PostDomain extends BaseEntityDto {
  @IsString()
  id: string;

  @Length(1, 30)
  @IsNotEmpty()
  title: string;

  @Length(0, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  blog: Blog;

  @IsString()
  blogId: string;
}
