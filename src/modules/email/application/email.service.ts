import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  ISendConfirmationCodeCommand,
  ISendRecoveryPasswordTempCodeCommand,
  ISendTestEmailCommand,
} from './interfaces';
import { EventPatterns } from './interfaces/enums';

@Injectable()
export class EmailService {
  constructor(@Inject('MESSAGE_SENDER_SERVICE') private client: ClientProxy) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async healthCheck() {
    await this.client.connect();
    return this.client.send<string>({ cmd: 'health-check' }, undefined);
  }

  async sendTestEmail({ email, userName }: ISendTestEmailCommand) {
    await this.client.emit(EventPatterns.SEND_TEST_EMAIL, {
      email,
      userName,
    });
  }

  async SendConfirmationCode({
    email,
    userName,
    confirmationCode,
  }: ISendConfirmationCodeCommand): Promise<void> {
    await this.client.emit(EventPatterns.SEND_CONFIRMATION_CODE, {
      email,
      userName,
      confirmationCode,
    });
  }

  async SendRecoveryPasswordTempCode({
    email,
    userName,
    recoveryCode,
  }: ISendRecoveryPasswordTempCodeCommand): Promise<void> {
    await this.client.emit(EventPatterns.SEND_RECOVERY_PASSWORD_TEMP_CODE, {
      email,
      userName,
      recoveryCode,
    });
  }
}
