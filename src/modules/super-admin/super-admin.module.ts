import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BlogsModule } from '../blogs/blogs.module';

import { BanBlogHandler } from './application/use-cases/ban-blog.handler';
import { SuperAdminController } from './controllers/super-admin.controller';

const CommandHandlers = [BanBlogHandler];

@Module({
  imports: [CqrsModule, BlogsModule],
  controllers: [SuperAdminController],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class SuperAdminModule {}
