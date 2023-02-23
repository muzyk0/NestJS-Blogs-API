import { Inject, Injectable } from '@nestjs/common';

import { ConfirmEmail, RecoveryEmail } from './interfaces/template-manager';

@Injectable()
export class EmailTemplateManager {
  constructor(@Inject('BASE_URL') private readonly baseUrl: string) {}

  getEmailConfirmationMessage({ userName, confirmationCode }: ConfirmEmail) {
    return `<div>
            <h1>Thanks for registration ${userName}</h1>
            <h3>Confirm your email</h3>
            <a href="${this.baseUrl}/confirm-email?code=${confirmationCode}">${this.baseUrl}/confirm-email?code=${confirmationCode}</a>
        </div>`;
  }

  getRecoveryPasswordMessage({ userName, recoveryCode }: RecoveryEmail) {
    return `<div>
            <h1>Password recovery for ${userName}</h1>
            <h3>To finish password recovery please follow the link below:</h3>
            <a href="${this.baseUrl}/password-recovery?recoveryCode=${recoveryCode}">${this.baseUrl}/password-recovery?recoveryCode=${recoveryCode}</a>
        </div>`;
  }
}
