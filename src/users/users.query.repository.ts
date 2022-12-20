import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { UserDto } from './dto/user.view.dto';
import { User, UserDocument } from './schemas/users.schema';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<UserDto>> {
    const filter = {
      ...(pageOptionsDto?.searchNameTerm
        ? { 'accountData.login': { $regex: pageOptionsDto.searchNameTerm } }
        : {}),
    };

    const itemsCount = await this.userModel.countDocuments(filter);

    const items = await this.userModel
      .find(filter, projectionFields)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy]: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize);

    return new PageDto({
      items: this.mapToDto(items),
      itemsCount,
      pageOptionsDto,
    });
  }

  mapToDto(users: UserDocument[]): UserDto[] {
    return users.map((u) => ({
      id: u.accountData.id,
      login: u.accountData.login,
      email: u.accountData.email,
      createdAt: u.accountData.createdAt,
    }));
  }
}
