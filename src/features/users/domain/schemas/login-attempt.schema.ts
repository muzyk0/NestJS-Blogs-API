import { Prop, SchemaFactory } from '@nestjs/mongoose';

export type LoginAttemptType = {
  attemptDate: Date;
  ip: string;
};

export class LoginAttempt implements LoginAttemptType {
  @Prop({ required: true })
  attemptDate: Date;

  @Prop({ required: true })
  ip: string;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
