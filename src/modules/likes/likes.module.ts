import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { LikesService } from './application/likes.service';
import { Like } from './domain/entity/like.entity';
import { LikesRepositorySql } from './infrastructure/likes.repository.sql';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), UsersModule],
  controllers: [],
  providers: [LikesService, LikesRepositorySql],
  exports: [LikesService, LikesRepositorySql],
})
export class LikesModule {}
