import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

import { TestingService } from '../application/testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  async clearDatabase(@Res() res: Response) {
    await this.testingService.clearDatabase();

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('health-check')
  async healthCheckMessageService() {
    await this.testingService.healthCheckMessageService();
    return {
      rabbitMQMessageSender: 'OK',
    };
  }
}
