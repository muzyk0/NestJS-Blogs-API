import { Module } from '@nestjs/common';
import { MessageServiceController } from './message-service.controller';
import { MessageServiceService } from './message-service.service';

@Module({
  imports: [],
  controllers: [MessageServiceController],
  providers: [MessageServiceService],
})
export class MessageServiceModule {}
