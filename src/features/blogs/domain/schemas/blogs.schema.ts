import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BlogDto } from '../../application/dto/blog.dto';

export type BlogDocument = Blog & Document;

export type BlogModelDto = Omit<BlogDto, 'createdAt' | 'updatedAt'> & {
  userId: string;
};

@Schema({ timestamps: true })
export class Blog implements BlogModelDto {
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

  @Prop()
  userId: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
