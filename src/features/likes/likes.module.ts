import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikesService } from './application/likes.service';
import { Like } from './domain/entity/like.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from './domain/schemas/comment-likes.schema';
import { LikesRepository } from './infrastructure/likes.repository';
import { LikesRepositorySql } from './infrastructure/likes.repository.sql';

@Module({
  controllers: [],
  imports: [
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  providers: [LikesService, LikesRepository, LikesRepositorySql],
  exports: [LikesService, LikesRepository, LikesRepositorySql],
})
export class LikesModule {}
