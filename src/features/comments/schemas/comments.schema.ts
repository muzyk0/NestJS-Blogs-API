import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { IComment } from '../dto/comment.dto';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment implements IComment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  postId: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
