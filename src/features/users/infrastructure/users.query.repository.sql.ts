import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { FilterQuery } from 'mongoose';
import { DataSource } from 'typeorm';

import {
  PageOptionsForUserDto,
  UserBanStatus,
} from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { BanTypeEnum } from '../../bans/application/interfaces/ban-type.enum';
import { Ban } from '../../bans/domain/entity/ban.entity';
import { BansRepositorySql } from '../../bans/infrastructure/bans.repository.sql';
import {
  UserBloggerViewModel,
  UserViewModel,
} from '../application/dto/user.view';
import { User } from '../domain/entities/user.entity';

export abstract class IUsersQueryRepository {
  abstract findOne(id: string): Promise<UserViewModel>;

  abstract findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>>;

  abstract mapToDto(users: User): UserViewModel;

  abstract mapToBloggerViewDto(users: User, ban: Ban): UserBloggerViewModel;

  abstract getBannedUsersForBlog(
    pageOptionsDto: PageOptionsForUserDto,
    blogId: string,
  ): Promise<PageDto<unknown>>;
}

@Injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly bansRepositorySql: BansRepositorySql,
  ) {}

  async findOne(id: string): Promise<UserViewModel> {
    const users: User[] = await this.dataSource.query(
      `
          SELECT *
          FROM "user"
          WHERE "user"."id" = $1
      `,
      [id],
    );
    return this.mapToDto(users[0]);
  }

  async findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>> {
    const filter: FilterQuery<User> = {
      $or: [
        pageOptionsDto?.searchLoginTerm
          ? {
              'accountData.login': {
                $regex: pageOptionsDto.searchLoginTerm,
                $options: 'si',
              },
            }
          : {},
        pageOptionsDto?.searchEmailTerm
          ? {
              'accountData.email': {
                $regex: pageOptionsDto.searchEmailTerm,
                $options: 'si',
              },
            }
          : {},
      ],
      ...(pageOptionsDto?.banStatus &&
      pageOptionsDto.banStatus !== UserBanStatus.ALL
        ? {
            'accountData.banned':
              pageOptionsDto.banStatus === UserBanStatus.BANNED
                ? { $ne: null }
                : null,
          }
        : {}),
    };

    const query = `
        WITH users AS
                 (SELECT *
                  FROM "user"
--              where (lower("banned") like '%' || lower($1) || '%')
                  WHERE (${
                    pageOptionsDto?.banStatus &&
                    pageOptionsDto.banStatus !== UserBanStatus.ALL
                      ? `
                          ${
                            pageOptionsDto.banStatus === UserBanStatus.BANNED
                              ? `banned IS nOt NULL`
                              : `banned IS NULL`
                          }
                        `
                      : 'banned IS NULL OR banned IS NOT NULL'
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

    const users: { total: number; items?: User[] } = await this.dataSource
      .query(query, queryParams)
      .then((res) => res[0]?.data);

    return new PageDto({
      items: users.items?.map(this.mapToDto) ?? [],
      itemsCount: users.total,
      pageOptionsDto,
    });
  }

  mapToDto(user: User): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      banInfo: {
        isBanned: Boolean(user.banned),
        banDate: user.banned ? new Date(user.banned).toISOString() : null,
        banReason: user.banReason,
      },
    };
  }

  mapToBloggerViewDto(users: User, ban: Ban): UserBloggerViewModel {
    return {
      id: users.id,
      login: users.login,
      banInfo: {
        isBanned: ban.isBanned,
        banDate: ban.updatedAt.toISOString(),
        banReason: ban.banReason,
      },
    };
  }

  async getBannedUsersForBlog(
    pageOptionsDto: PageOptionsForUserDto,
    blogId: string,
  ) {
    const bans = await this.bansRepositorySql.getBansByBlogId({
      parentId: blogId,
      type: BanTypeEnum.BLOG,
    });

    const bansUserIds = bans.map((ban) => ban.userId);

    const filter: FilterQuery<User> = {
      'accountData.id': { $in: bansUserIds },
      $or: [
        pageOptionsDto?.searchLoginTerm
          ? {
              'accountData.login': {
                $regex: pageOptionsDto.searchLoginTerm,
                $options: 'si',
              },
            }
          : {},
        pageOptionsDto?.searchEmailTerm
          ? {
              'accountData.email': {
                $regex: pageOptionsDto.searchEmailTerm,
                $options: 'si',
              },
            }
          : {},
      ],
      ...(pageOptionsDto?.banStatus &&
      pageOptionsDto.banStatus !== UserBanStatus.ALL
        ? {
            'accountData.banned':
              pageOptionsDto.banStatus === UserBanStatus.BANNED
                ? { $ne: null }
                : null,
          }
        : {}),
    };

    // const itemsCount = await this.userModel.countDocuments(filter);
    //
    // const items = await this.userModel
    //   .find(filter)
    //   .skip(pageOptionsDto.skip)
    //   .sort({
    //     [pageOptionsDto.sortBy !== 'createdAt'
    //       ? `accountData.${pageOptionsDto.sortBy}`
    //       : 'createdAt']: pageOptionsDto.sortDirection,
    //   })
    //   .limit(pageOptionsDto.pageSize);

    // TODO
    const itemsWithBan = [].map((item) => {
      const ban = bans.find((ban) => ban.userId === item.id);

      return this.mapToBloggerViewDto(item, ban);
    });
    return new PageDto({
      items: itemsWithBan,
      // TODO
      itemsCount: 0,
      pageOptionsDto,
    });
  }
}
