import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { BlogsRepository } from './blogs.repository';
import { BlogDto } from './dto/blog.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

interface IBlogService {
  create(createBlogDto: Omit<CreateBlogDto, 'id'>): Promise<BlogDto>;
  findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BlogDto>>;
  findOne(id: string): Promise<BlogDto>;
  update(id: string, updateBlogDto: UpdateBlogDto): Promise<BlogDto>;
  remove(id: string): Promise<boolean>;
}

@Injectable()
export class BlogsService implements IBlogService {
  constructor(private blogsRepository: BlogsRepository) {}

  async create(createBlogDto: Omit<CreateBlogDto, 'id'>) {
    const newBlog = {
      id: v4(),
      name: createBlogDto.name,
      youtubeUrl: createBlogDto.youtubeUrl,
    };
    return this.blogsRepository.create(newBlog);
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    return this.blogsRepository.findAll(pageOptionsDto);
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
