import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { PostDto } from '../../application/dto/post.dto';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
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
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
