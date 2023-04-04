import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { getRepositoryModule } from '../../../shared/utils/get-repository.module-loader';
import { EmailServiceLocal } from '../../email-local/application/email-local.service';
import { TestingService } from '../application/testing.service';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingService, // @Inject('MESSAGE_SENDER_SERVICE') private client: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  // async onApplicationBootstrap() {
  //   await this.client.connect();
  // }

  @Delete('all-data')
  async clearDatabase(@Res() res: Response) {
    await this.testingService.clearDatabase();

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('send-test-email')
  async healthCheckMessageService() {
    const res = await this.testingService.sendTestEmail();
    return {
      rabbitMQMessageSender: JSON.stringify(res),
    };
  }

  @Get('health-check')
  async healthCheck() {
    const mode = this.configService.get<string>('MODE');
    return {
      mode: mode,
    };
  }

  // @Get('health-check')
  // async healthCheck() {
  //   return this.client.send<string>(
  //     { cmd: 'health-check' },
  //     { payload: 'this is payload from blogs service' },
  //   );
  // }
}
