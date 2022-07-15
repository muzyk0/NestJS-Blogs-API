import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/posts.schema';
import { PostsRepository } from './posts.repository';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, BloggersRepository],
})
export class PostsModule {}
