import { IsNotEmpty, IsString, Length } from 'class-validator';

import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto implements Partial<CreateCommentDto> {
  @Length(20, 300)
  @IsNotEmpty()
  content: string;
}
