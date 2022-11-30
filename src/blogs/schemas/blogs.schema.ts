import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BlogDto } from '../dto/blog.dto';

export type BlogDocument = Blog & Document;

@Schema()
export class Blog implements BlogDto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  websiteUrl: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
