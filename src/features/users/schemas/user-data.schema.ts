import { Prop, SchemaFactory } from '@nestjs/mongoose';

export interface IUser {
  id: string;
  login: string;
  email: string;
  password: string;
}

export class UserData implements IUser {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserDataSchema = SchemaFactory.createForClass(UserData);
