import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ISendConfirmationCodeCommand } from '../../email/application/interfaces';

import { SendConfirmationCodeCommand } from './use-cases/send-confirmation-code.handler';
import {
  ISendRecoveryPasswordTempCodeCommand,
  SendRecoveryPasswordTempCodeCommand,
} from './use-cases/send-recovery-password-temp-code.handler';
import {
  ISendTestEmailCommand,
  SendTestEmailCommand,
} from './use-cases/send-test-email.handler';

@Injectable()
export class EmailServiceLocal {
  constructor(private readonly commandBus: CommandBus) {}

  async healthCheck(payload?: string) {
    console.log(payload);
    return `Message service works correctly! Payload: ${JSON.stringify(
      payload,
    )}`;
  }

  async sendTestEmail({ email, userName }: ISendTestEmailCommand) {
    return this.commandBus.execute(new SendTestEmailCommand(email, userName));
  }

  async SendConfirmationCode({
    email,
    userName,
    confirmationCode,
  }: ISendConfirmationCodeCommand): Promise<void> {
    return this.commandBus.execute(
      new SendConfirmationCodeCommand(email, userName, confirmationCode),
    );
  }

  async SendRecoveryPasswordTempCode({
    email,
    userName,
    recoveryCode,
  }: ISendRecoveryPasswordTempCodeCommand): Promise<void> {
    return this.commandBus.execute(
      new SendRecoveryPasswordTempCodeCommand(email, userName, recoveryCode),
    );
  }
}
