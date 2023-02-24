import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailTemplateManager } from '../email-template-manager';
import { EmailService } from '../email.service';

export interface ISendTestEmailCommand {
  email: string;
  userName: string;
}

export class SendTestEmailCommand implements ISendTestEmailCommand {
  constructor(
    public readonly email: string,
    public readonly userName: string,
  ) {}
}

@CommandHandler(SendTestEmailCommand)
export class SendTestEmailHandler
  implements ICommandHandler<SendTestEmailCommand>
{
  constructor(
    private readonly emailTemplateManager: EmailTemplateManager,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email, userName }: SendTestEmailCommand): Promise<boolean> {
    await this.emailService.sendEmail(
      email,
      `This is test message for user ${userName}`,
      `<h3>OK<h3/>`,
    );
    return true;
  }
}
