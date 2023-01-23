import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

/* eslint import/order: ["error", {"newlines-between": "ignore"}] */
import { configModule } from './constants';
import { EmailModule } from './features/email/email.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { CommentsModule } from './features/comments/comments.module';
import configuration from './config/configuration';
import { LimitsModule } from './features/limits/limits.module';
import { PostsModule } from './features/posts/posts.module';
import { TestModule } from './features/test-users/test-users.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { SecurityModule } from './features/security/security.module';
import { PasswordRecoveryModule } from './features/password-recovery/password-recovery.module';
import { LikesModule } from './features/likes/likes.module';
import typeOrmConfig from './config/typeorm.config';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(configuration().MONGO_URI),
    TypeOrmModule.forRoot(typeOrmConfig.options),
    EmailModule,
    TestModule,
    BlogsModule,
    PostsModule,
    AuthModule,
    UsersModule,
    TestingModule,
    CommentsModule,
    LimitsModule,
    SecurityModule,
    PasswordRecoveryModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
