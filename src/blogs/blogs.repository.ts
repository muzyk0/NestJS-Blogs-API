import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';

import { IBlogsRepository } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogDocument } from './schemas/blogs.schema';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async create(createBlogDto: BlogDto) {
    const blog = await this.blogModel.create(createBlogDto);
    return this.blogModel.findOne({ id: blog.id }, BASE_PROJECTION);
  }

  async findOne(id: string): Promise<BlogDto> {
    return this.blogModel.findOne({ id }, BASE_PROJECTION).lean();
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    return this.blogModel.findOneAndUpdate(
      { id },
      { $set: updateBlogDto },
      { returnDocument: 'after', projection: BASE_PROJECTION },
    );
  }

  async remove(id: string) {
    const res = await this.blogModel.deleteOne({ id });

    return res.deletedCount === 1;
  }
}
