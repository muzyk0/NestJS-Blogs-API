import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsForUserDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { UserDto } from './dto/user.view.dto';
import { User, UserDocument } from './schemas/users.schema';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ id }, BASE_PROJECTION);
    return this.mapToDto(user);
  }

  async findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserDto>> {
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
    };

    const itemsCount = await this.userModel.countDocuments(filter);

    const items = await this.userModel
      .find(filter, projectionFields)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy
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

  mapToDto(users: UserDocument): UserDto {
    return {
      id: users.accountData.id,
      login: users.accountData.login,
      email: users.accountData.email,
      createdAt: users.createdAt,
    };
  }
}
