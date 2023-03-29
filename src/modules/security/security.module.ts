import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityController } from './controllers/security.controller';
import { Device } from './domain/entities/security.entity';
import {
  ISecurityQueryRepository,
  SecurityQuerySqlRepository,
} from './infrastructure/security.query.sql.repository';
import {
  ISecurityRepository,
  SecurityRepository,
} from './infrastructure/security.sql.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
  controllers: [SecurityController],
  providers: [
    { provide: ISecurityRepository, useClass: SecurityRepository },
    { provide: ISecurityQueryRepository, useClass: SecurityQuerySqlRepository },
  ],
  exports: [
    { provide: ISecurityRepository, useClass: SecurityRepository },
    { provide: ISecurityQueryRepository, useClass: SecurityQuerySqlRepository },
  ],
})
export class SecurityModule {}
