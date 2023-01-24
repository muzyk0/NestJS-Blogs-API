import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: Request): string {
    return this.appService.getHello(req.get('host'));
  }

  @Get('blog-platform')
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
