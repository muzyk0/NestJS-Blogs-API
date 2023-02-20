import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityController } from './api/security.controller';
import { SecurityService } from './application/security.service';
import { Security } from './domain/entities/security.entity';
import {
  ISecurityQueryRepository,
  SecurityQuerySqlRepository,
} from './infrastructure/security.query.sql.repository';
import {
  ISecurityRepository,
  SecurityRepository,
} from './infrastructure/security.sql.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Security])],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    { provide: ISecurityRepository, useClass: SecurityRepository },
    { provide: ISecurityQueryRepository, useClass: SecurityQuerySqlRepository },
  ],
  exports: [
    SecurityService,
    { provide: ISecurityRepository, useClass: SecurityRepository },
    { provide: ISecurityQueryRepository, useClass: SecurityQuerySqlRepository },
  ],
})
export class SecurityModule {}
