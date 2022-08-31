import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';

import { BloggersController } from './bloggers.controller';
import { BloggersRepository } from './bloggers.repository';
import { BloggersService } from './bloggers.service';
import { Blogger, BloggerSchema } from './schemas/bloggers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
    AuthModule,
    PostsModule,
  ],
  controllers: [BloggersController],
  providers: [BloggersService, BloggersRepository],
})
export class BloggersModule {}
