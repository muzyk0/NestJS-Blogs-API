import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SecurityDto } from '../dto/security.dto';

export type SecurityDocument = Security & Document;

@Schema()
export class Security implements SecurityDto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  expireAt: Date;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  userId: string;
}

export const SecuritySchema = SchemaFactory.createForClass(Security);
