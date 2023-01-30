import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { UserData } from '../../users/domain/schemas/user-data.schema';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BlogDto, BlogDtoForSuperAdmin } from '../application/dto/blog.dto';
import {
  Blog,
  BlogDocument,
  BlogModelDto,
} from '../domain/schemas/blogs.schema';

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
    role?: 'super-admin' | 'user',
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

    const ownersBlogs = await this.usersRepository.findByIds(
      items.map((blog) => blog.userId),
    );

    if (withBanned) {
      return new PageDto({
        items:
          role === 'super-admin'
            ? items.map((item) =>
                this.mapToDtoForSuperAdmin(
                  item,
                  ownersBlogs.find((u) => u.accountData.id === item.userId)
                    .accountData,
                ),
              )
            : items.map((item) => this.mapToDto(item)),
        itemsCount,
        pageOptionsDto,
      });
    }

    const ownersBlogsIds = ownersBlogs
      .filter((user) => Boolean(user.accountData.banned) === false)
      .map((user) => user.accountData.id);

    const mappedItems: BlogModelDto[] = items.filter((item) =>
      ownersBlogsIds.includes(item.userId),
    );

    return new PageDto({
      items:
        role === 'super-admin'
          ? mappedItems.map((item) =>
              this.mapToDtoForSuperAdmin(
                item,
                ownersBlogs.find((u) => u.accountData.id === item.userId)
                  .accountData,
              ),
            )
          : mappedItems.map((item) => this.mapToDto(item)),
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

  mapToDto(blog: BlogDto): BlogDto {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
    };
  }

  mapToDtoForSuperAdmin(blog: BlogDto, user: UserData): BlogDtoForSuperAdmin {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      blogOwnerInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    };
  }
}
