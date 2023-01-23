import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikesService } from './application/likes.service';
import { Like } from './domain/entity/like.entity';
import { LikesRepositorySql } from './infrastructure/likes.repository.sql';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [LikesService, LikesRepositorySql],
  exports: [LikesService, LikesRepositorySql],
})
export class LikesModule {}
