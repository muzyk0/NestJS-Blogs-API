import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsModule } from '../blogs/blogs.module';

import { UpdateBanUserForBlogHandler } from './application/use-cases/update-ban-user-for-blog.handler';
import { Ban } from './domain/entity/ban.entity';
import { BansRepositorySql } from './infrastructure/bans.repository.sql';

const CommandHandlers = [UpdateBanUserForBlogHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Ban]), BlogsModule],
  controllers: [],
  providers: [...CommandHandlers, BansRepositorySql],
  exports: [...CommandHandlers, BansRepositorySql],
})
export class BansModule {}
