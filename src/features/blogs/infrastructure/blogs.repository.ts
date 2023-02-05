import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { BlogDto } from '../application/dto/blog.dto';
import { CreateBlogDto } from '../application/dto/create-blog.dto';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import {
  Blog,
  BlogDocument,
  BlogModelDto,
} from '../domain/schemas/blogs.schema';

export interface IBlogsRepository {
  create(createBlogDto: CreateBlogDto): Promise<BlogDto>;

  findOne(id: string): Promise<BlogDto>;

  update(id: string, updateBlogDto: UpdateBlogDto): Promise<BlogDto>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async create(createBlogDto: BlogModelDto) {
    const blog = await this.blogModel.create(createBlogDto);
    return this.blogModel.findOne({ id: blog.id }, BASE_PROJECTION);
  }

  async findOne(id: string): Promise<BlogModelDto> {
    return this.blogModel.findOne({ id }, BASE_PROJECTION).lean();
  }

  async findMany(ids: string[]): Promise<BlogDocument[]> {
    return this.blogModel.find({ $in: ids }, BASE_PROJECTION);
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

  async bindBlogOnUser(blogId: string, userId: string) {
    const blog = await this.blogModel.findOneAndUpdate(
      { id: blogId, userId: null },
      {
        $set: {
          userId: userId,
        },
      },
    );
    return blog;
  }

  updateBanStatus(
    blogId: string,
    isBanned: boolean,
    banDate: Date | null = null,
  ) {
    return this.blogModel.findOneAndUpdate(
      { id: blogId },
      {
        $set: {
          isBanned,
          banDate,
        },
      },
      { returnDocument: 'after', projection: BASE_PROJECTION },
    );
  }
}
