import { Controller, Delete, HttpStatus, Res } from '@nestjs/common';
import { TestingService } from './testing.service';
import { Response } from 'express';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  async clearDatabase(@Res() res: Response) {
    await this.testingService.clearDatabase();

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
