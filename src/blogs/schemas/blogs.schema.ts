import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BlogDto } from '../dto/blog.dto';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog implements Omit<BlogDto, 'createdAt' | 'updatedAt'> {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
