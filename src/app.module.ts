import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import configuration from './config/configuration';
import { EmailModule } from './email/email.module';
import { LimitsModule } from './limits/limits.module';
import { PostsModule } from './posts/posts.module';
import { TestModule } from './test-users/test-users.module';
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(configuration().MONGO_URI),
    TestModule,
    BlogsModule,
    PostsModule,
    AuthModule,
    UsersModule,
    TestingModule,
    CommentsModule,
    EmailModule,
    LimitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
