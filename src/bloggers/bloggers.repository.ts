import { Injectable } from '@nestjs/common';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blogger, BloggerDocument } from './schemas/bloggers.schema';
import { Model } from 'mongoose';
import { BloggerDto } from './dto/blogger.dto';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
  ) {}

  async create(createBloggerDto: BloggerDto) {
    return this.bloggerModel.create(createBloggerDto);
  }

  async findAll() {
    return this.bloggerModel.find({});
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
