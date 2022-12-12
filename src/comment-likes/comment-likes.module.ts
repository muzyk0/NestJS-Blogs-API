import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentLikesRepository } from './comment-likes.repository';
import { CommentLikesService } from './comment-likes.service';
import { CommentLike, CommentLikeSchema } from './schemas/comment-likes.schema';

@Module({
  controllers: [],
  imports: [
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  providers: [CommentLikesService, CommentLikesRepository],
  exports: [CommentLikesService, CommentLikesRepository],
})
export class CommentLikesModule {}
