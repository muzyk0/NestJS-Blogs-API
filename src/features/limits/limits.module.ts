import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LimitsService } from './application/limits.service';
import { Limit, LimitSchema } from './domain/schemas/limits.schema';
import { LimitsRepository } from './infrastructure/limits.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
  ],
  providers: [LimitsService, LimitsRepository],
  exports: [LimitsService, LimitsRepository],
})
export class LimitsModule {}
