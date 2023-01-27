import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SuperAdminController } from './api /super-admin.controller';
import { SuperAdminService } from './application/super-admin.service';

@Module({
  imports: [CqrsModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
