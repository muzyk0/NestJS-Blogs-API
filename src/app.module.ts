import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

/* eslint import/order: ["error", {"newlines-between": "ignore"}] */
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModule } from './constants';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { CommentsModule } from './features/comments/comments.module';
import configuration from './config/configuration';
import { EmailModule } from './features/email/email.module';
import { LimitsModule } from './features/limits/limits.module';
import { PostsModule } from './features/posts/posts.module';
import { TestModule } from './features/test-users/test-users.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { SecurityModule } from './features/security/security.module';
import { PasswordRecoveryModule } from './features/password-recovery/password-recovery.module';
import { LikesModule } from './features/likes/likes.module';
import typeOrmConfig from './config/typeorm.config';

console.log('typeOrmConfig.options', typeOrmConfig.options);
console.log('configuration()', configuration());

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(configuration().MONGO_URI),
    TypeOrmModule.forRoot(typeOrmConfig.options),
    TestModule,
    BlogsModule,
    PostsModule,
    AuthModule,
    UsersModule,
    TestingModule,
    CommentsModule,
    EmailModule,
    LimitsModule,
    SecurityModule,
    PasswordRecoveryModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
