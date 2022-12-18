import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentLikesRepository } from './comment-likes.repository';
import { CommentLikesRepositorySql } from './comment-likes.repository.sql';
import { CommentLikesService } from './comment-likes.service';
import { Like } from './entity/like.entity';
import { CommentLike, CommentLikeSchema } from './schemas/comment-likes.schema';

@Module({
  controllers: [],
  imports: [
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  providers: [
    CommentLikesService,
    CommentLikesRepository,
    CommentLikesRepositorySql,
  ],
  exports: [
    CommentLikesService,
    CommentLikesRepository,
    CommentLikesRepositorySql,
  ],
})
export class CommentLikesModule {}
