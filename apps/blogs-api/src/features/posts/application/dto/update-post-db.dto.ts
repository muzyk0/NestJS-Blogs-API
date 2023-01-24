import { PartialType } from '@nestjs/mapped-types';
import { Length } from 'class-validator';

import { CreatePostDto } from './create-post.dto';

export class UpdatePostDbDto extends PartialType(CreatePostDto) {
  @Length(1)
  blogName?: string;
}
