import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { LimitDto } from '../dto/limitDto';

export type LimitDocument = Limit & Document;

@Schema()
export class Limit implements LimitDto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const LimitSchema = SchemaFactory.createForClass(Limit);
