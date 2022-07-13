import { PartialType } from '@nestjs/mapped-types';
import { CreateBloggerDto } from './create-blogger.dto';
import { IsUUID } from 'class-validator';

export class UpdateBloggerDto extends PartialType(CreateBloggerDto) {
  @IsUUID()
  id: string;
}
