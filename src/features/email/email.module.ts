import { Global, Module } from '@nestjs/common';

import { EmailService } from './application/email.service';
import { rabbitMQModule } from './constants';

@Global()
@Module({
  imports: [rabbitMQModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
