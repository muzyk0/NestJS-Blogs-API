import { Prop, SchemaFactory } from '@nestjs/mongoose';

export type RevokedTokenType = {
  userAgent: string;
  token: string;
};

export class RevokedTokens implements RevokedTokenType {
  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  token: string;
}

export const RevokedTokensSchema = SchemaFactory.createForClass(RevokedTokens);
