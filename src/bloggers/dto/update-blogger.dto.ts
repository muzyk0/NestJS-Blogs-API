import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';

import { CreateBloggerDto } from './create-blogger.dto';

export class UpdateBloggerDto extends PartialType(CreateBloggerDto) {
  @IsUUID()
  id: string;
}
