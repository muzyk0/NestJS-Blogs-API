import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async send(mail: ISendMailOptions) {
    return this.mailerService.sendMail(mail);
  }

  async sendEmail(email: string, subject: string, template: string) {
    try {
      await this.send({
        from: '"9ART.ru 👻" <info@9art.ru>',
        to: email,
        subject,
        html: template,
      });
    } catch (e) {
      throw new Error(`Email isn't send. Error: ${e}`);
    }
  }
}
