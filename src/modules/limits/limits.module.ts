import { Module } from '@nestjs/common';

import { LimitsService } from './application/limits.service';
import { LimitsRepository } from './infrastructure/limits.repository';

@Module({
  imports: [],
  providers: [LimitsService, LimitsRepository],
  exports: [LimitsService, LimitsRepository],
})
export class LimitsModule {}
