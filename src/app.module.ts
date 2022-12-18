import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

/* eslint import/order: ["error", {"newlines-between": "ignore"}] */
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModule } from './constants';

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
import { SecurityModule } from './security/security.module';
import { PasswordRecoveryModule } from './password-recovery/password-recovery.module';
import { CommentLikesModule } from './comment-likes/comment-likes.module';
import { Like } from './comment-likes/entity/like.entity';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(configuration().MONGO_URI),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRESQL_URI'),
        entities: [Like],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
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
    CommentLikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
