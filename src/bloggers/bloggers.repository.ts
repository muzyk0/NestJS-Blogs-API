import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    return this.bloggerModel.create(createBloggerDto);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BloggerDto>> {
    const filter = {
      ...(pageOptionsDto?.SearchNameTerm
        ? { name: { $regex: pageOptionsDto.SearchNameTerm } }
        : {}),
    };

    const itemsCount = await this.bloggerModel.countDocuments(filter);

    const items = await this.bloggerModel
      .find(filter)
      .skip(pageOptionsDto.skip)
      .limit(pageOptionsDto.PageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BloggerDto> {
    return this.bloggerModel.findOne({ id });
  }

  async update(id: string, updateBloggerDto: UpdateBloggerDto) {
    return this.bloggerModel.findOneAndUpdate(
      { id },
      { $set: updateBloggerDto },
    );
  }

  async remove(id: string) {
    const res = await this.bloggerModel.deleteOne({ id });

    return res.deletedCount === 1;
  }
}
