import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MockEmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async send(mail: ISendMailOptions) {
    return this.mailerService.sendMail(mail);
  }

  async sendEmail(email: string, subject: string, template: string) {
    return;
  }
}
