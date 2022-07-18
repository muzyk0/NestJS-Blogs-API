import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { TestingRepository } from './testing.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { User, UserSchema } from '../users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
