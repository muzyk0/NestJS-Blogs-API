import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async send(mail: ISendMailOptions) {
    return this.mailerService.sendMail(mail);
  }

  async sendEmail(email: string, subject: string, template: string) {
    try {
      const info = await this.send({
        from: '"9ART.ru 👻" <info@9art.ru>',
        to: email,
        subject,
        html: template,
      });

      console.log('Message sent: %s', info);
    } catch (e) {
      throw new Error(`Email isn't send. Error: ${e}`);
    }
  }
}
