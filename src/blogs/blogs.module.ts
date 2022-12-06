import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';
import { Security, SecuritySchema } from '../security/schemas/security.schema';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogsRepository } from './blogs.repository';
import { BlogsService } from './blogs.service';
import { Blog, BlogSchema } from './schemas/blogs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
    AuthModule,
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
