import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EmailServiceLocal } from './application/email-local.service';
import { EmailTemplateManager } from './application/email-template-manager';
import { EmailService } from './application/email.service';
import { SendConfirmationCodeHandler } from './application/use-cases/send-confirmation-code.handler';
import { SendRecoveryPasswordTempCodeHandler } from './application/use-cases/send-recovery-password-temp-code.handler';
import { SendTestEmailHandler } from './application/use-cases/send-test-email.handler';

const CommandHandlers = [
  SendConfirmationCodeHandler,
  SendRecoveryPasswordTempCodeHandler,
  SendTestEmailHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    EmailService,
    EmailServiceLocal,
    EmailTemplateManager,
    { provide: 'BASE_URL', useValue: 'https://9art.ru' },
    ...CommandHandlers,
  ],
  exports: [
    EmailService,
    EmailServiceLocal,
    EmailTemplateManager,
    { provide: 'BASE_URL', useValue: 'https://9art.ru' },
    ...CommandHandlers,
  ],
})
export class EmailModuleLocal {}
