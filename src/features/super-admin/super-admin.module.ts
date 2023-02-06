import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BlogsModule } from '../blogs/blogs.module';

import { SuperAdminController } from './api /super-admin.controller';
import { SuperAdminService } from './application/super-admin.service';
import { BanBlogHandler } from './application/use-cases/ban-blog.handler';

const CommandHandlers = [BanBlogHandler];

@Module({
  imports: [CqrsModule, BlogsModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, ...CommandHandlers],
  exports: [SuperAdminService, ...CommandHandlers],
})
export class SuperAdminModule {}
