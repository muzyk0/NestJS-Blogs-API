import { Module } from '@nestjs/common';

import { LimitsService } from './application/limits.service';
import {
  ILimitsRepository,
  LimitsRepository,
} from './infrastructure/limits.repository';

const Providers = [
  LimitsService,
  { provide: ILimitsRepository, useClass: LimitsRepository },
];

@Module({
  imports: [],
  providers: [...Providers],
  exports: [...Providers],
})
export class LimitsModule {}
