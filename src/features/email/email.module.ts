import { join } from 'path';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import configuration from '../../config/configuration';

import { EmailTemplateManager } from './email-template-manager';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        return {
          // or transport: config.get("MAIL_TRANSPORT"),
          transport: {
            service: 'Gmail',
            auth: {
              user: config.get('EMAIL_FROM'),
              pass: config.get('EMAIL_FROM_PASSWORD'),
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('EMAIL_FROM')}>`,
          },
          // preview: true,
          template: {
            dir: join(__dirname, 'templates'), // or process.cwd() + '/template/'
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    EmailService,
    EmailTemplateManager,
    { provide: 'BASE_URL', useValue: configuration().BASE_URL },
  ],
  exports: [
    EmailService,
    EmailTemplateManager,
    { provide: 'BASE_URL', useValue: configuration().BASE_URL },
  ],
})
export class EmailModule {}
