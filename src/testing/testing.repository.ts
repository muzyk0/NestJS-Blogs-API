import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Blog, BlogDocument } from '../blogs/schemas/blogs.schema';
import { Comment, CommentDocument } from '../comments/schemas/comments.schema';
import { Limit, LimitDocument } from '../limits/schemas/limits.schema';
import { Post, PostDocument } from '../posts/schemas/posts.schema';
import {
  Security,
  SecurityDocument,
} from '../security/schemas/security.schema';
import { User, UserDocument } from '../users/schemas/users.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Limit.name) private limitModel: Model<LimitDocument>,
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
  ) {}

  async clearDatabase(): Promise<boolean> {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.limitModel.deleteMany({});
    await this.securityModel.deleteMany({});

    return true;
  }
}
