import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BlogDto } from '../application/dto/blog.dto';
import { Blog, BlogDocument } from '../domain/schemas/blogs.schema';

export interface IBlogsQueryRepository {
  findOne(id: string): Promise<BlogDto>;

  findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<BlogDto>>;
}

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(
    pageOptionsDto: PageOptionsDto,
    userId?: string,
    withBanned?: boolean,
  ): Promise<PageDto<BlogDto>> {
    const filter = {
      ...(pageOptionsDto?.searchNameTerm
        ? { name: { $regex: pageOptionsDto.searchNameTerm, $options: 'i' } }
        : {}),
      ...(userId ? { userId } : {}),
    };

    const itemsCount = await this.blogModel.countDocuments(filter);

    const items = await this.blogModel
      .find(filter, BASE_PROJECTION)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy]: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    if (withBanned) {
      const mappedItems: BlogDto[] = items.map((item) => this.mapToDto(item));

      return new PageDto({
        items: mappedItems,
        itemsCount,
        pageOptionsDto,
      });
    }

    const ownersBlogs = await this.usersRepository.findByIds(
      items.map((blog) => blog.id),
    );

    const ownersBlogsIds = ownersBlogs
      .filter((user) => Boolean(user.accountData.banned))
      .map((user) => user.accountData.id);

    const mappedItems: BlogDto[] = items
      .filter((item) => ownersBlogsIds.includes(item.id))
      .map((item) => this.mapToDto(item));

    return new PageDto({
      items: mappedItems,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BlogDto> {
    const blog = await this.blogModel.findOne({ id }, BASE_PROJECTION);

    const user = await this.usersRepository.findOneById(blog.userId);
    if (Boolean(user.accountData.banned)) {
      return;
    }

    if (!blog) {
      return;
    }

    return this.mapToDto(blog);
  }

  mapToDto(blog: BlogDocument): BlogDto {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
    };
  }
}
