import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogExistsRule } from '../../common/decorators/validations/check-blogId-if-exist.decorator';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';
import {
  Security,
  SecuritySchema,
} from '../security/domain/schemas/security.schema';

import { BloggerController } from './api/blogger.controller';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { Blog, BlogSchema } from './domain/schemas/blogs.schema';
import { BlogsQueryRepository } from './infrastructure/blogs.query.repository';
import { BlogsRepository } from './infrastructure/blogs.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
    AuthModule,
    PostsModule,
  ],
  controllers: [BlogsController, BloggerController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsRule,
  ],
  exports: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
