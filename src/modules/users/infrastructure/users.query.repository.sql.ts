import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PageOptionsForUserDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { UserRawSqlDto } from '../application/dto/user.dto';
import { User } from '../domain/entities/user.entity';

import { UserWithBannedInfoForBlogView } from './dto/user-with-banned-info-for-blog.view';
import {
  UserBloggerViewModel,
  UserMeQueryViewModel,
  UserViewModel,
} from './dto/user.view';

export abstract class IUsersQueryRepository {
  abstract findOneForMeQuery(id: string): Promise<UserMeQueryViewModel>;

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
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findOneForMeQuery(id: string): Promise<UserMeQueryViewModel | null> {
    const [user]: User[] = await this.dataSource.query(
      `
          SELECT u.*
          FROM "users" u
                   LEFT JOIN bans b ON b."userId" = u.id
          WHERE u.id = $1
            and b.banned is null
      `,
      [id],
    );

    if (!user) {
      return null;
    }
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }

  async findOne(id: string): Promise<UserViewModel | null> {
    const [user]: UserRawSqlDto[] = await this.dataSource.query(
      `
          SELECT u.*, b.banned, b."banReason"
          FROM "users" u
                   LEFT JOIN bans b ON b."userId" = u.id
          WHERE u.id = $1
      `,
      [id],
    );

    if (!user) {
      return null;
    }
    return this.mapToDto(user);
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
                  WHERE CASE
                            WHEN $4::TEXT != 'all'
            THEN CASE WHEN $4 = 'banned' THEN b2.banned IS NOT NULL ELSE b2.banned IS NULL END
                            else true END
                      AND CASE
                              WHEN $5::text IS NOT NULL
                     OR $6::text IS NOT NULL THEN
            (case
            when $5 is not null
            then "login" ILIKE '%' || $5 || '%' end OR
            case
            when $6 is not null
            then "email" ILIKE '%' || $6 || '%' end)
            else true
        END
        )


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table users
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from users) c(total) on true
              group by c.total) t1
    `;

    const queryParams = [
      pageOptionsDto.sortDirection,
      pageOptionsDto.pageSize,
      pageOptionsDto.skip,
      pageOptionsDto?.banStatus,
      pageOptionsDto.searchLoginTerm,
      pageOptionsDto.searchEmailTerm,
    ];

    const users: { total: number; items?: UserRawSqlDto[] } =
      await this.dataSource
        .query(query, queryParams)
        .then((res) => res[0]?.data);

    return new PageDto({
      items: users.items?.map(this.mapToDto) ?? [],
      itemsCount: users.total,
      pageOptionsDto,
    });
  }

  mapToDto(user: UserRawSqlDto): UserViewModel {
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
                           LEFT JOIN bloggers_ban_users as b2 ON b2."blogId" = $5
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
