import { Prop, SchemaFactory } from '@nestjs/mongoose';

export type EmailConfirmationType = {
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
  sentEmails: SentConfirmationEmailType[];
};

export type SentConfirmationEmailType = {
  sentDate: Date;
};

export class SentConfirmationEmail implements SentConfirmationEmailType {
  @Prop({ required: true })
  sentDate: Date;
}

export const SentConfirmationEmailSchema = SchemaFactory.createForClass(
  SentConfirmationEmail,
);

export class EmailConfirmation implements EmailConfirmationType {
  @Prop({ required: true })
  isConfirmed: boolean;

  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ type: [SentConfirmationEmailSchema], required: true })
  sentEmails: SentConfirmationEmail[];
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
