import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { BlogDto } from './dto/blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogDocument } from './schemas/blogs.schema';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async create(createBlogDto: BlogDto) {
    const blog = await this.blogModel.create(createBlogDto);
    return this.blogModel.findOne({ id: blog.id }, BASE_PROJECTION);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BlogDto>> {
    const filter = {
      ...(pageOptionsDto?.searchNameTerm
        ? { name: { $regex: pageOptionsDto.searchNameTerm } }
        : {}),
    };

    const itemsCount = await this.blogModel.countDocuments(filter);

    const items = await this.blogModel
      .find(filter, BASE_PROJECTION)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy]: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BlogDto> {
    return this.blogModel.findOne({ id }, BASE_PROJECTION);
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
