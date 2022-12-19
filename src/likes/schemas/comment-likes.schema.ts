import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { CommentLikeStatus } from '../interfaces/like-status.enum';

/** @deprecated */
export type CommentLikeType = {
  id: string;
  userId: string;
  commentId: string;
  status: CommentLikeStatus;
};

/** @deprecated */
export type CommentLikeDocument = HydratedDocument<CommentLikeType>;

/** @deprecated */
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

/** @deprecated */
export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
