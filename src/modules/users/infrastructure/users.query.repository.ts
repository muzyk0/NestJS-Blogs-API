import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PageOptionsForUserDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { UserRawSqlDto } from '../application/dto/user.dto';
import { IUsersQueryRepository } from '../controllers/interfaces/users-query-repository.abstract-class';
import { User } from '../domain/entities/user.entity';

import { UserWithBannedInfoForBlogView } from './dto/user-with-banned-info-for-blog.view';
import {
  UserBloggerViewModel,
  UserMeQueryViewModel,
  UserViewModel,
} from './dto/user.view';

@Injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findOneForMeQuery(id: string): Promise<UserMeQueryViewModel | null> {
    const user = await this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('bans', 'b', 'b.userId = u.id')
      .where('u.id = :userId', { userId: id })
      .andWhere('b.banned is null')
      .getOne();

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
    const user = await this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('bans', 'b', 'b.userId = u.id')
      .where('u.id = :userId', { userId: id })
      .getOne();

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
      items: users.items?.map(this.mapToDtoForRawSql) ?? [],
      itemsCount: users.total,
      pageOptionsDto,
    });
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

  private mapToDto(user: User): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      banInfo: {
        isBanned: user.bans?.[0] ? Boolean(user.bans[0].banned) : false,
        banDate: user.bans?.[0].banned
          ? user.bans[0].banned?.toISOString()
          : null,
        banReason: user.bans?.[0]?.banReason ?? null,
      },
    };
  }

  private mapToDtoForRawSql(user: UserRawSqlDto): UserViewModel {
    // TODO: Remove this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      // banInfo: {
      //   isBanned: Boolean(user.banned),
      //   banDate: user.banned ? new Date(user.banned).toISOString() : null,
      //   banReason: user.banReason,
      // },
    };
  }

  private mapToBloggerViewDto(
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
}
