import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LimitsRepository } from './limits.repository';
import { LimitsService } from './limits.service';
import { Limit, LimitSchema } from './schemas/limits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
  ],
  providers: [LimitsService, LimitsRepository],
  exports: [LimitsService, LimitsRepository],
})
export class LimitsModule {}
