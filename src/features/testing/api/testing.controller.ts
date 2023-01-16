import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';

import { TestingService } from '../application/testing.service';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingService,
    @Inject('MESSAGE_SENDER_SERVICE') private client: ClientProxy,
  ) {}

  @Delete('all-data')
  async clearDatabase(@Res() res: Response) {
    await this.testingService.clearDatabase();

    res.status(HttpStatus.NO_CONTENT).send();
  }

  // @Get('health-check')
  // async healthCheckMessageService() {
  //   const res = await this.testingService.healthCheckMessageService();
  //   return {
  //     rabbitMQMessageSender: JSON.stringify(res),
  //   };
  // }
  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get('health-check')
  async healthCheck() {
    // await this.client.connect();
    console.log('health-check');
    return this.client.send<string>({ cmd: 'health-check' }, {});
  }
}
