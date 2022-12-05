import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { BlogDto } from './dto/blog.dto';
import { Blog, BlogDocument } from './schemas/blogs.schema';

export interface IBlogsQueryRepository {
  findOne(id: string): Promise<BlogDto>;

  findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BlogDto>>;
}

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

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

    const mappedItems: BlogDto[] = items.map((item) => this.mapToDto(item));

    return new PageDto({
      items: mappedItems,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BlogDto> {
    const blog = await this.blogModel.findOne({ id }, BASE_PROJECTION);
    return this.mapToDto(blog);
  }

  mapToDto(blog: BlogDocument): BlogDto {
    return {
      id: blog.id,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
    };
  }
}
