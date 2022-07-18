import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCommentDto implements Partial<CreateCommentDto> {
  @IsString()
  id: string;

  @Length(20, 300)
  @IsNotEmpty()
  content: string;
}
