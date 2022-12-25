import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { LikeStatus } from '../../application/interfaces/like-status.enum';

/** @deprecated */
export type CommentLikeType = {
  id: string;
  userId: string;
  parentId: string;
  status: LikeStatus;
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
  parentId: string;

  @Prop({ required: true })
  status: LikeStatus;
}

/** @deprecated */
export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
