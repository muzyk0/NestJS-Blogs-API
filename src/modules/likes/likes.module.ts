import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { LikesService } from './application/likes.service';
import { Like } from './domain/entity/like.entity';
import {
  ILikesRepository,
  LikesRepositorySql,
} from './infrastructure/likes.repository.sql';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), UsersModule],
  controllers: [],
  providers: [
    LikesService,
    { provide: ILikesRepository, useClass: LikesRepositorySql },
  ],
  exports: [
    LikesService,
    { provide: ILikesRepository, useClass: LikesRepositorySql },
  ],
})
export class LikesModule {}
