import { Inject, Injectable } from '@nestjs/common';

import { RecoveryPasswordMessageType } from '../../users/application/interfaces/recovery-password-message.type';
import { UserAccountDBType } from '../../users/domain/schemas/users.schema';

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
