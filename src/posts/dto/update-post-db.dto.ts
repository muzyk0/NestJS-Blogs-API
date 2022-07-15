import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { Length } from 'class-validator';

export class UpdatePostDbDto extends PartialType(CreatePostDto) {
  @Length(1)
  bloggerName?: string;
}
