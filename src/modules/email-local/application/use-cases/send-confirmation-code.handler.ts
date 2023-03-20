import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailTemplateManager } from '../email-template-manager';
import { EmailService } from '../email.service';

export interface ISendConfirmationCodeCommand {
  email: string;
  userName: string;
  confirmationCode: string;
}

export class SendConfirmationCodeCommand
  implements ISendConfirmationCodeCommand
{
  constructor(
    public readonly email: string,
    public readonly userName: string,
    public readonly confirmationCode: string,
  ) {}
}

@CommandHandler(SendConfirmationCodeCommand)
export class SendConfirmationCodeHandler
  implements ICommandHandler<SendConfirmationCodeCommand>
{
  constructor(
    private readonly emailTemplateManager: EmailTemplateManager,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    email,
    userName,
    confirmationCode,
  }: SendConfirmationCodeCommand): Promise<boolean> {
    const emailTemplate = this.emailTemplateManager.getEmailConfirmationMessage(
      {
        userName,
        confirmationCode,
      },
    );

    await this.emailService.sendEmail(
      email,
      'Confirm your account ✔',
      emailTemplate,
    );
    return true;
  }
}
