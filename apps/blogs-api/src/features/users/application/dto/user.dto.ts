import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserDto {
  @IsString()
  id: string;

  @Length(3, 10)
  @IsNotEmpty()
  login: string;
}
