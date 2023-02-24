import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @Length(20, 300)
  @IsNotEmpty()
  content: string;

  @IsString()
  userId: string;

  @IsString()
  userLogin: string;

  @IsString()
  postId: string;
}
