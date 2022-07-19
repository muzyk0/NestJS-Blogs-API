import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BloggerDto } from '../dto/blogger.dto';

export type BloggerDocument = Blogger & Document;

@Schema()
export class Blogger implements BloggerDto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  youtubeUrl: string;
}

export const BloggerSchema = SchemaFactory.createForClass(Blogger);
