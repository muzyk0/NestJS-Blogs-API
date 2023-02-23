import { IsNotEmpty, Length } from 'class-validator';

export class CommentInput {
  @Length(20, 300)
  @IsNotEmpty()
  content: string;
}
