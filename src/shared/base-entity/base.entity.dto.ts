import { IsDate } from 'class-validator';

export class BaseEntityDto {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
