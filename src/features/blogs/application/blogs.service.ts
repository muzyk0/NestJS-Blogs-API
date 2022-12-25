import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { IBlogService } from '../api/blogs.controller';
import { BlogsRepository } from '../infrastructure/blogs.repository';

import { BlogDto } from './dto/blog.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

export interface IBlogsRepository {
  create(createBlogDto: CreateBlogDto): Promise<BlogDto>;

  findOne(id: string): Promise<BlogDto>;

  update(id: string, updateBlogDto: UpdateBlogDto): Promise<BlogDto>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class BlogsService implements IBlogService {
  constructor(private blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto) {
    const newBlog: BlogDto = {
      id: v4(),
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    };
    return this.blogsRepository.create(newBlog);
  }

  async findOne(id: string) {
    return this.blogsRepository.findOne(id);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    return this.blogsRepository.update(id, updateBlogDto);
  }

  async remove(id: string) {
    return this.blogsRepository.remove(id);
  }
}
