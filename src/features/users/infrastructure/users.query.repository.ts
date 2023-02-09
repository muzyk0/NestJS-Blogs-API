import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import {
  PageOptionsForUserDto,
  UserBanStatus,
} from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { BanTypeEnum } from '../../bans/application/interfaces/ban-type.enum';
import { BansRepositorySql } from '../../bans/infrastructure/bans.repository.sql';
import {
  UserBloggerViewModel,
  UserViewModel,
} from '../application/dto/user.view';
import { User, UserDocument } from '../domain/schemas/users.schema';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly bansRepositorySql: BansRepositorySql,
  ) {}

  async findOne(id: string): Promise<UserViewModel> {
    const user = await this.userModel.findOne({ id }, BASE_PROJECTION);
    return this.mapToDto(user);
  }

  async findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>> {
    const filter: FilterQuery<UserDocument> = {
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

    const itemsCount = await this.userModel.countDocuments(filter);

    const items = await this.userModel
      .find(filter, projectionFields)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy !== 'createdAt'
          ? `accountData.${pageOptionsDto.sortBy}`
          : 'createdAt']: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    return new PageDto({
      items: items.map(this.mapToDto),
      itemsCount,
      pageOptionsDto,
    });
  }

  mapToDto(users: UserDocument): UserViewModel {
    return {
      id: users.accountData.id,
      login: users.accountData.login,
      email: users.accountData.email,
      createdAt: users.createdAt,
      banInfo: {
        isBanned: Boolean(users.accountData.banned),
        banDate: users.accountData.banned?.toISOString() ?? null,
        banReason: users.accountData.banReason,
      },
    };
  }

  mapToBloggerViewDto(users: UserDocument): UserBloggerViewModel {
    return {
      id: users.accountData.id,
      login: users.accountData.login,
      banInfo: {
        isBanned: Boolean(users.accountData.banned),
        banDate: users.accountData.banned?.toISOString() ?? null,
        banReason: users.accountData.banReason,
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

    const filter: FilterQuery<UserDocument> = {
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

    const itemsCount = await this.userModel.countDocuments(filter);

    const items = await this.userModel
      .find(filter, projectionFields)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy !== 'createdAt'
          ? `accountData.${pageOptionsDto.sortBy}`
          : 'createdAt']: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    return new PageDto({
      items: items.map(this.mapToBloggerViewDto),
      itemsCount,
      pageOptionsDto,
    });
  }
}
