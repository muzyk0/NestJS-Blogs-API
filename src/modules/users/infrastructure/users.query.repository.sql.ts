import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  PageOptionsForUserDto,
  UserBanStatus,
} from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { BloggerBansRepositorySql } from '../../bans/infrastructure/blogger-bans.repository.sql';
import { UserRowSqlDto } from '../application/dto/user.dto';
import { User } from '../domain/entities/user.entity';

import { UserWithBannedInfoForBlogView } from './dto/user-with-banned-info-for-blog.view';
import { UserBloggerViewModel, UserViewModel } from './dto/user.view';

export abstract class IUsersQueryRepository {
  abstract findOne(id: string): Promise<UserViewModel>;

  abstract findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>>;

  abstract getBannedUsersForBlog(
    pageOptionsDto: PageOptionsForUserDto,
    blogId: string,
  ): Promise<PageDto<unknown>>;
}

@Injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly bansRepositorySql: BloggerBansRepositorySql,
  ) {}

  async findOne(id: string): Promise<UserViewModel> {
    const users: UserRowSqlDto[] = await this.dataSource.query(
      `
          SELECT *
          FROM "users"
          WHERE id = $1
      `,
      [id],
    );
    return this.mapToDto(users[0]);
  }

  async findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>> {
    const query = `
        WITH users AS
                 (SELECT u.*,
                         b2."banned"    as "banned",
                         b2."banReason" as "banReason"
                  FROM users as u
                           LEFT JOIN bans as b2 ON b2."userId" = u.id
                  WHERE
                     (${
                       pageOptionsDto?.banStatus &&
                       pageOptionsDto.banStatus !== UserBanStatus.ALL
                         ? `
                          ${
                            pageOptionsDto.banStatus === UserBanStatus.BANNED
                              ? `b2.banned IS nOt NULL`
                              : `b2.banned IS NULL`
                          }
                        `
                         : true
                     }) ${
      pageOptionsDto.searchLoginTerm || pageOptionsDto.searchEmailTerm
        ? `AND (${
            pageOptionsDto.searchLoginTerm
              ? `LOWER("login") LIKE '%' || LOWER('${pageOptionsDto.searchLoginTerm}') || '%'`
              : ''
          } ${
            pageOptionsDto.searchEmailTerm
              ? `OR LOWER("email") LIKE '%' || LOWER('${pageOptionsDto.searchEmailTerm}') || '%'`
              : ''
          })`
        : ''
    })


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table users
                  order by
                      case when $1 = 'desc' then "${
                        pageOptionsDto.sortBy
                      }" end desc,
                      case when $1 = 'asc' then "${
                        pageOptionsDto.sortBy
                      }" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from users) c(total) on true
              group by c.total) t1
    `;

    const queryParams = [
      pageOptionsDto.sortDirection,
      pageOptionsDto.pageSize,
      pageOptionsDto.skip,
    ];

    const users: { total: number; items?: UserRowSqlDto[] } =
      await this.dataSource
        .query(query, queryParams)
        .then((res) => res[0]?.data);

    return new PageDto({
      items: users.items?.map(this.mapToDto) ?? [],
      itemsCount: users.total,
      pageOptionsDto,
    });
  }

  mapToDto(user: UserRowSqlDto): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      banInfo: {
        isBanned: Boolean(user.banned),
        banDate: user.banned ? new Date(user.banned).toISOString() : null,
        banReason: user.banReason ?? null,
      },
    };
  }

  mapToBloggerViewDto(
    user: UserWithBannedInfoForBlogView,
  ): UserBloggerViewModel {
    return {
      id: user.id,
      login: user.login,
      banInfo: {
        isBanned: Boolean(user.bannedDateForBlog),
        banDate: new Date(user.updatedAtForBlog).toISOString(),
        banReason: user.banReasonForBlog,
      },
    };
  }

  async getBannedUsersForBlog(
    pageOptionsDto: PageOptionsForUserDto,
    blogId: string,
  ) {
    const query = `
        WITH users AS
                 (SELECT u.*,
                         b2."banned"    as "bannedDateForBlog",
                         b2."banReason" as "banReasonForBlog",
                         b2."updatedAt" as "updatedAtForBlog"
                  FROM users as u
                           LEFT JOIN blogs_bans as b2 ON b2."blogId" = $5
                  where u.id = b2."userId"
                    AND b2."banned" IS NOT NULL
                    AND case
                            when cast(null as TEXT) IS NOT NULL THEN u.login ILIKE '%' || $4 || '%'
                            ELSE true END)

        select row_to_json(t1) as data
        from (select c.total, jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table users
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from users) c (total) on true
              group by c.total) t1;
    `;

    const posts: { total: number; items?: User[] } = await this.dataSource
      .query(query, [
        pageOptionsDto.sortDirection,
        pageOptionsDto.pageSize,
        pageOptionsDto.skip,
        pageOptionsDto.searchNameTerm,
        blogId,
      ])
      .then((res) => res[0]?.data);

    return new PageDto({
      items: (posts.items ?? []).map(this.mapToBloggerViewDto),
      itemsCount: posts.total,
      pageOptionsDto,
    });
  }
}
