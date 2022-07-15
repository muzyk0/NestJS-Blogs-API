import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogger, BloggerDocument } from '../bloggers/schemas/bloggers.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/posts.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
  ) {}

  async clearDatabase(): Promise<boolean> {
    await this.bloggerModel.deleteMany({});
    await this.postModel.deleteMany({});

    return true;
  }
}
