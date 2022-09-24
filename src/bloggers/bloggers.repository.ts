import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { BloggerDto } from './dto/blogger.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { Blogger, BloggerDocument } from './schemas/bloggers.schema';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
  ) {}

  async create(createBloggerDto: BloggerDto) {
    const blogger = await this.bloggerModel.create(createBloggerDto);
    return this.bloggerModel.findOne({ id: blogger.id }, BASE_PROJECTION);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BloggerDto>> {
    const filter = {
      ...(pageOptionsDto?.searchNameTerm
        ? { name: { $regex: pageOptionsDto.searchNameTerm } }
        : {}),
    };

    const itemsCount = await this.bloggerModel.countDocuments(filter);

    const items = await this.bloggerModel
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

  async findOne(id: string): Promise<BloggerDto> {
    return this.bloggerModel.findOne({ id }, BASE_PROJECTION);
  }

  async update(id: string, updateBloggerDto: UpdateBloggerDto) {
    return this.bloggerModel.findOneAndUpdate(
      { id },
      { $set: updateBloggerDto },
      { returnDocument: 'after', projection: BASE_PROJECTION },
    );
  }

  async remove(id: string) {
    const res = await this.bloggerModel.deleteOne({ id });

    return res.deletedCount === 1;
  }
}
