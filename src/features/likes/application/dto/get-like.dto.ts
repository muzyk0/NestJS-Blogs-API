import { IsString } from 'class-validator';

export class GetLikeDto {
  @IsString()
  parentId: string;
}
