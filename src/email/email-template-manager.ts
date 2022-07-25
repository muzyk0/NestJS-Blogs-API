import { Inject, Injectable } from '@nestjs/common';

import { UserAccountDBType } from '../users/schemas/users.schema';

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
}
