import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { PostDto } from '../dto/post.dto';

export type PostDocument = Post & Document;

@Schema()
export class Post implements PostDto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  bloggerId: string;

  @Prop({ required: true })
  bloggerName: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
