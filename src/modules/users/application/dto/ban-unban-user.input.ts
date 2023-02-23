import { IsBoolean, IsNotEmpty, Length } from 'class-validator';

export class BanUnbanUserInput {
  @IsBoolean()
  isBanned: boolean;

  @Length(20)
  @IsNotEmpty()
  banReason: string;
}
