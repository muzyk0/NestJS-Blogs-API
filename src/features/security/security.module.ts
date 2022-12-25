import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SecurityController } from './api/security.controller';
import { SecurityService } from './application/security.service';
import { Security, SecuritySchema } from './domain/schemas/security.schema';
import { SecurityQueryRepository } from './infrastructure/security.query.repository';
import { SecurityRepository } from './infrastructure/security.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [SecurityService, SecurityRepository, SecurityQueryRepository],
  exports: [SecurityService, SecurityRepository, SecurityQueryRepository],
})
export class SecurityModule {}
