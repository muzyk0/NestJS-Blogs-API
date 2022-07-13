import { Injectable } from '@nestjs/common';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { BloggersRepository } from './bloggers.repository';
import { v4 } from 'uuid';
import { BloggerDto } from './dto/blogger.dto';

interface IBloggersService {
  create(createBloggerDto: Omit<CreateBloggerDto, 'id'>): Promise<BloggerDto>;
  findAll(): Promise<BloggerDto[]>;
  findOne(id: string): Promise<BloggerDto>;
  update(id: string, updateBloggerDto: UpdateBloggerDto): Promise<BloggerDto>;
  remove(id: string): Promise<boolean>;
}

@Injectable()
export class BloggersService implements IBloggersService {
  constructor(private bloggersRepository: BloggersRepository) {}

  async create(createBloggerDto: Omit<CreateBloggerDto, 'id'>) {
    const newBlogger = {
      id: v4(),
      name: createBloggerDto.name,
      youtubeUrl: createBloggerDto.youtubeUrl,
    };
    return this.bloggersRepository.create(newBlogger);
  }

  async findAll() {
    return this.bloggersRepository.findAll();
  }

  async findOne(id: string) {
    return this.bloggersRepository.findOne(id);
  }

  async update(id: string, updateBloggerDto: UpdateBloggerDto) {
    return this.bloggersRepository.update(id, updateBloggerDto);
  }

  async remove(id: string) {
    return this.bloggersRepository.remove(id);
  }
}
