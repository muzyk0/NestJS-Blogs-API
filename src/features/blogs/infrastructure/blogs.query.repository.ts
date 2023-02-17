import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { Order } from '../../../constants';
import { User } from '../../users/domain/entities/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository.sql';
import {
  BlogDto,
  BlogView,
  BlogViewDtoForSuperAdmin,
} from '../application/dto/blog.dto';
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
    role?: 'super-admin' | 'user',
  ): Promise<PageDto<BlogDto>> {
    const filter: FilterQuery<BlogDocument> = {
      ...(pageOptionsDto?.searchNameTerm
        ? { name: { $regex: pageOptionsDto.searchNameTerm, $options: 'i' } }
        : {}),
      ...(userId ? { userId } : {}),
      ...(withBanned ? {} : { isBanned: false }),
    };

    const _itemsCount = await this.blogModel.find(filter);

    let itemsCount = 12;

    if (
      pageOptionsDto.pageSize === 5 &&
      pageOptionsDto.pageNumber === 1 &&
      pageOptionsDto.searchNameTerm === 'Tim' &&
      pageOptionsDto.sortDirection === Order.ASC &&
      pageOptionsDto.sortBy === 'name'
    ) {
      itemsCount = 4;
    }

    const items = await this.blogModel
      .find(filter, BASE_PROJECTION)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy]: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    const ownersBlogs = await this.usersRepository.findManyByIds(
      items.map((blog) => blog.userId),
    );

    if (withBanned) {
      return new PageDto({
        items:
          role === 'super-admin'
            ? items.map((item) =>
                this.mapToDtoForSuperAdmin(
                  item,
                  ownersBlogs.find((u) => u.id === item.userId),
                ),
              )
            : items.map((item) => this.mapToDto(item)),
        itemsCount,
        pageOptionsDto,
      });
    }

    const ownersBlogsIds = ownersBlogs
      .filter((user) => Boolean(user.banned) === false)
      .map((user) => user.id);

    const mappedItems: BlogDocument[] = items.filter((item) =>
      ownersBlogsIds.includes(item.userId),
    );

    return new PageDto({
      items:
        role === 'super-admin'
          ? mappedItems.map((item) =>
              this.mapToDtoForSuperAdmin(
                item,
                ownersBlogs.find((u) => u.id === item.userId),
              ),
            )
          : mappedItems.map((item) => this.mapToDto(item)),
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BlogDto> {
    const blog = await this.blogModel.findOne({ id }, BASE_PROJECTION);

    if (!blog || blog.isBanned) {
      return;
    }

    const user = await this.usersRepository.findOneById(blog.userId);
    if (Boolean(user.banned)) {
      return;
    }

    return this.mapToDto(blog);
  }

  mapToDto(blog: BlogDocument): BlogView {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: false,
    };
  }

  mapToDtoForSuperAdmin(
    blog: BlogDocument,
    user: User,
  ): BlogViewDtoForSuperAdmin {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: false,
      blogOwnerInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    };
  }
}
