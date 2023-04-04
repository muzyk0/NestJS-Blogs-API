import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBlogDto } from '../application/dto/create-blog.dto';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { IBlogsRepository } from '../application/interfaces/blog.abstract-class';
import { Blog } from '../domain/entities/blog.entity';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
  ) {}

  async create({
    name,
    description,
    websiteUrl,
    userId,
  }: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepo.create({
      name,
      description,
      websiteUrl,
      userId,
    });

    return this.blogRepo.save(blog);
  }

  async findOne(id: string): Promise<Blog | null> {
    return this.blogRepo.findOne({ where: { id } });
  }

  async update(
    blogId: string,
    { name, description, websiteUrl }: UpdateBlogDto,
  ): Promise<Blog> {
    const updatedBlog = await this.blogRepo.update(
      { id: blogId },
      { name, description, websiteUrl },
    );

    if (!updatedBlog.affected) {
      throw new Error('Blog not found');
    }

    return this.blogRepo.findOne({
      where: { id: blogId },
    });
  }

  async remove(id: string): Promise<boolean> {
    const blog = await this.blogRepo.findOne({ where: { id } });

    const result = await this.blogRepo.remove(blog);
    return !!result;
  }

  async bindBlogOnUser(blogId: string, userId: string): Promise<Blog> {
    const result = await this.blogRepo.update({ id: blogId }, { userId });

    if (!result.affected) {
      throw new Error('Blog not found');
    }

    return this.blogRepo.findOne({ where: { id: blogId } });
  }

  async updateBanStatus(
    blogId: string,
    isBanned: boolean,
  ): Promise<Blog | null> {
    const banned = isBanned ? new Date() : null;

    await this.blogRepo.update({ id: blogId }, { banned });

    return this.blogRepo.findOne({ where: { id: blogId } });
  }
}
