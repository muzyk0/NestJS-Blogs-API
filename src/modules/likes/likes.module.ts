import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';

import { ILikesRepository } from './application/interfaces/likes-repository.abstract-class';
import { Like } from './domain/entity/like.entity';
import { LikesRepository } from './infrastructure/likes.repository';
import { LikesRepositorySql } from './infrastructure/likes.repository.sql';

const Provider = [
  {
    provide: ILikesRepository,
    useClass: getRepositoryModule(LikesRepository, LikesRepositorySql),
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  controllers: [],
  providers: Provider,
  exports: Provider,
})
export class LikesModule {}
