import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Like } from './entity/like.entity';
import { LikesRepository } from './likes.repository';
import { LikesRepositorySql } from './likes.repository.sql';
import { LikesService } from './likes.service';
import { CommentLike, CommentLikeSchema } from './schemas/comment-likes.schema';

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
