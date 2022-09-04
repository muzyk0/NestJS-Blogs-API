import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  EmailConfirmation,
  EmailConfirmationType,
} from './email-confirmation.schema';
import { LoginAttempt, LoginAttemptType } from './login-attempt.schema';
import { RevokedTokens, RevokedTokenType } from './revoked-tokens.schema';
import { IUser, UserData } from './user-data.schema';

export type UserAccountDBType = {
  accountData: IUser;
  loginAttempts: LoginAttemptType[];
  emailConfirmation: EmailConfirmationType;
  revokedTokens: RevokedTokenType[];
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

  @Prop({ required: false, default: [] })
  revokedTokens: RevokedTokens[];
}

export const UserSchema = SchemaFactory.createForClass(User);
