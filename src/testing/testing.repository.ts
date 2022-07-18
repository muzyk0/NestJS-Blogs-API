import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogger, BloggerDocument } from '../bloggers/schemas/bloggers.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/posts.schema';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Comment, CommentDocument } from '../comments/schemas/comments.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async clearDatabase(): Promise<boolean> {
    await this.bloggerModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.commentModel.deleteMany({});

    return true;
  }
}
