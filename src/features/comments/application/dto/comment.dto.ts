import { IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

export interface IComment {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  postId: string;
}

export class CommentDto implements IComment {
  @IsString()
  id: string;

  @Length(20, 300)
  @IsNotEmpty()
  content: string;

  @IsString()
  userId: string;

  @IsString()
  userLogin: string;

  @IsString()
  postId: string;

  @IsDate()
  createdAt: Date;
}
