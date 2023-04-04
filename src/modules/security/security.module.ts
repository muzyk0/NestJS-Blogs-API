import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';

import { ISecurityRepository } from './application/inerfaces/ISecurityRepository';
import { CommandHandlers } from './application/use-cases';
import { ISecurityQueryRepository } from './controllers/interfaces/security-query-repository.abstract-class';
import { SecurityController } from './controllers/security.controller';
import { Device } from './domain/entities/security.entity';
import { SecurityQueryRepository } from './infrastructure/security.query.repository';
import { SecurityQuerySqlRepository } from './infrastructure/security.query.sql.repository';
import { SecurityRepository } from './infrastructure/security.repository';
import { SecuritySqlRepository } from './infrastructure/security.sql.repository';

const Providers = [
  {
    provide: ISecurityRepository,
    useClass: getRepositoryModule(SecurityRepository, SecuritySqlRepository),
  },
  {
    provide: ISecurityQueryRepository,
    // useFactory: getRepositoryModule(
    //   SecurityQueryRepository,
    //   SecurityQuerySqlRepository,
    // ),
    useClass: getRepositoryModule(
      SecurityQueryRepository,
      SecurityQuerySqlRepository,
    ),
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
  controllers: [SecurityController],
  providers: [...CommandHandlers, ...Providers],
  exports: [...CommandHandlers, ...Providers],
})
export class SecurityModule {}
