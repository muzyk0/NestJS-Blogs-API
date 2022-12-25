import { Inject, Injectable } from '@nestjs/common';

import { UserAccountDBType } from '../../users/schemas/users.schema';
import { RecoveryPasswordMessageType } from '../../users/types/recovery-password-message.type';

@Injectable()
export class EmailTemplateManager {
  constructor(@Inject('BASE_URL') private readonly baseUrl: string) {}

  getEmailConfirmationMessage(user: UserAccountDBType) {
    return `<div>
            <h1>Thanks for registration ${user.accountData.login}</h1>
            <h3>Confirm your email</h3>
            <a href="${this.baseUrl}/confirm-email?code=${user.emailConfirmation.confirmationCode}">${this.baseUrl}/confirm-email?code=${user.emailConfirmation.confirmationCode}</a>
        </div>`;
  }

  getRecoveryPasswordMessage({
    recoveryCode,
    userName,
  }: RecoveryPasswordMessageType) {
    return `<div>
            <h1>Password recovery for ${userName}</h1>
            <h3>To finish password recovery please follow the link below:</h3>
            <a href="${this.baseUrl}/password-recovery?recoveryCode=${recoveryCode}">${this.baseUrl}/password-recovery?recoveryCode=${recoveryCode}</a>
        </div>`;
  }
}
