import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import {
  BlogDto,
  BlogView,
  BlogViewDtoForSuperAdmin,
} from '../application/dto/blog.dto';
import { Blog } from '../domain/entities/blog.entity';
import { BlogRowSqlDto } from '../interfaces/BlogRowSqlDto';

export abstract class IBlogsQueryRepository {
  abstract findOne(id: string): Promise<BlogView>;

  abstract findAll(
    pageOptionsDto: PageOptionsDto,
    userId?: string,
  ): Promise<PageDto<BlogView>>;

  abstract findAllForAdmin(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<BlogViewDtoForSuperAdmin>>;
}

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(
    pageOptionsDto: PageOptionsDto,
    userId?: string,
  ): Promise<PageDto<BlogView>> {
    const query = `
        WITH blogs AS
                 (SELECT b.*, u.login as "userLogin"
                  FROM blogs as b
                           lEFT JOIN users as u ON b."userId" = u.id
                  where b.banned IS NULL
                    AND case
                            when cast($5 as UUID) IS NOT NULL THEN b."userId" = $5
                            ELSE true END
                    AND case
                            when cast($4 as TEXT) IS NOT NULL THEN b.name ILIKE '%' || $4 || '%'
                            ELSE true END)


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table blogs
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from blogs) c(total) on true
              group by c.total) t1;
    `;

    const blogs: { total: number; items?: Blog[] } = await this.dataSource
      .query(query, [
        pageOptionsDto.sortDirection,
        pageOptionsDto.pageSize,
        pageOptionsDto.skip,
        pageOptionsDto.searchNameTerm,
        userId,
      ])
      .then((res) => res[0]?.data);

    return new PageDto({
      items: (blogs.items ?? []).map((item) => this.mapToDto(item)),
      itemsCount: blogs.total,
      pageOptionsDto,
    });
  }

  async findAllForAdmin(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<BlogViewDtoForSuperAdmin>> {
    const query = `
        WITH blogs AS
                 (SELECT b.*, u.login as "userLogin"
                  FROM blogs as b
                           lEFT JOIN users as u ON b."userId" = u.id
                  where (b.banned IS NULL OR b.banned IS NOT NULL)
                    AND case
                            when cast($4 as TEXT) IS NOT NULL THEN b.name ILIKE '%' || $4 || '%'
                            ELSE true END)

        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) as "items"
              from (table blogs
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from blogs) c(total) on true
              group by c.total) t1;
    `;
    const blogs: { total: number; items?: BlogRowSqlDto[] } =
      await this.dataSource
        .query(query, [
          pageOptionsDto.sortDirection,
          pageOptionsDto.pageSize,
          pageOptionsDto.skip,
          pageOptionsDto.searchNameTerm,
        ])
        .then((res) => res[0]?.data);

    return new PageDto({
      items: (blogs.items ?? []).map((item) =>
        this.mapToDtoForSuperAdmin(item),
      ),
      itemsCount: blogs.total,
      pageOptionsDto,
    });
  }

  async findOne(id: string): Promise<BlogView> {
    try {
      const [blog] = await this.dataSource.query(
        `
            SELECT b.*
            FROM blogs as b
            where b.id = $1
              and b.banned is null
            ORDER BY "createdAt";
        `,
        [id],
      );

      return this.mapToDto(blog);
    } catch {
      throw new NotFoundException();
    }
  }

  mapToDto(blog: Blog): BlogView {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: false,
    };
  }

  mapToDtoForSuperAdmin(blog: BlogRowSqlDto): BlogViewDtoForSuperAdmin {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.userLogin,
      },
      banInfo: {
        isBanned: Boolean(blog.banned),
        banDate: blog.banned ? new Date(blog.banned).toISOString() : null,
      },
    };
  }
}
