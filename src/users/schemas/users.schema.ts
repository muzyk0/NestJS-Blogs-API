import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IUser, UserData } from './user-data.schema';
import { LoginAttempt, LoginAttemptType } from './login-attempt.schema';
import {
  EmailConfirmation,
  EmailConfirmationType,
} from './email-confirmation.schema';

export type UserAccountDBType = {
  accountData: IUser;
  loginAttempts: LoginAttemptType[];
  emailConfirmation: EmailConfirmationType;
};

export type UserDocument = User & Document;

@Schema()
export class User implements UserAccountDBType {
  @Prop({ required: true })
  accountData: UserData;

  @Prop({ required: true })
  loginAttempts: LoginAttempt[];

  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
