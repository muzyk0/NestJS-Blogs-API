import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Security, SecuritySchema } from './schemas/security.schema';
import { SecurityController } from './security.controller';
import { SecurityQueryRepository } from './security.query.repository';
import { SecurityRepository } from './security.repository';
import { SecurityService } from './security.service';

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
