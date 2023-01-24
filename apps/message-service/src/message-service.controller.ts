import { Controller, Get } from '@nestjs/common';
import { MessageServiceService } from './message-service.service';

@Controller()
export class MessageServiceController {
  constructor(private readonly messageServiceService: MessageServiceService) {}

  @Get()
  getHello(): string {
    return this.messageServiceService.getHello();
  }
}
