import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { CommentLikeStatus } from '../interfaces/comment-like-status.enum';

export type CommentLikeType = {
  id: string;
  userId: string;
  commentId: string;
  status: CommentLikeStatus;
};

export type CommentLikeDocument = HydratedDocument<CommentLikeType>;

@Schema({ timestamps: true })
export class CommentLike implements CommentLikeType {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  status: CommentLikeStatus;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
