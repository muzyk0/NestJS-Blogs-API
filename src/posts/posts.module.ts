import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/posts.schema';
import { PostsRepository } from './posts.repository';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { AuthModule } from '../auth/auth.module';
import { BloggersService } from '../bloggers/bloggers.service';
import { CommentsService } from '../comments/comments.service';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { CommentsRepository } from '../comments/comments.repository';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    BloggersRepository,
    BloggersService,
    CommentsService,
    CommentsRepository,
  ],
})
export class PostsModule {}
