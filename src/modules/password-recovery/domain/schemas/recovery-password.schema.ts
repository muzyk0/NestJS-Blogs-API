import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PasswordRecoveryType = {
  userId: string;
  code: string;
  isValid: boolean;
};

export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

@Schema({ timestamps: true })
export class PasswordRecovery implements PasswordRecoveryType {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  isValid: boolean;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
