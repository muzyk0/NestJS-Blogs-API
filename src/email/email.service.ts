import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

import { MailType } from './email.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async send(mail: MailType) {
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
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (e) {
      console.log(`email isn't send. Error: ${e}`);
    }
  }
}
