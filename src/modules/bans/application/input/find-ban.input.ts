import { IsNotEmpty, IsString } from 'class-validator';

export class FindBanInput {
  @IsString()
  userId: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}

export class FindBanByBlogIdInput {
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
