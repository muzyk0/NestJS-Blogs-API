import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { TestingService } from '../application/testing.service';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingService, // @Inject('MESSAGE_SENDER_SERVICE') private client: ClientProxy,
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

  // @Get('health-check')
  // async healthCheck() {
  //   console.log('health-check');
  //   return this.client.send<string>(
  //     { cmd: 'health-check' },
  //     { payload: 'this is payload from blogs service' },
  //   );
  // }
}
