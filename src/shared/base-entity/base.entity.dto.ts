import { IsDate, IsOptional } from 'class-validator';

export class BaseEntityDto {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deleted: Date;
}
