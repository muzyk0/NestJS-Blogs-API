import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { RevokedTokenType } from './schemas/revoked-tokens.schema';
import { User, UserAccountDBType, UserDocument } from './schemas/users.schema';
import { UpdateConfirmationType } from './users.interface';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: UserAccountDBType): Promise<User> {
    const userWithLoginOrEmail = await this.userModel.findOne({
      $or: [
        { 'accountData.login': createUserDto.accountData.login },
        { 'accountData.email': createUserDto.accountData.email },
      ],
    });

    if (userWithLoginOrEmail) {
      return null;
    }

    await this.userModel.create(createUserDto);

    return this.userModel.findOne(
      { 'accountData.id': createUserDto.accountData.id },
      { projection: projectionFields },
    );
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
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
      items,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOneByLoginOrEmail(loginOrEmail: string): Promise<User> {
    const user = await this.userModel.findOne(
      {
        $or: [
          { 'accountData.login': loginOrEmail },
          { 'accountData.email': loginOrEmail },
        ],
      },
      BASE_PROJECTION,
    );
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne(
      { 'accountData.email': email },
      BASE_PROJECTION,
    );
  }

  async findOneByConfirmationCode(code: string) {
    return this.userModel.findOne(
      {
        'emailConfirmation.confirmationCode': code,
      },
      BASE_PROJECTION,
    );
  }

  async findOneById(id: string) {
    return this.userModel.findOne({ 'accountData.id': id }, BASE_PROJECTION);
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ 'accountData.id': id });
    return result.deletedCount === 1;
  }

  async setIsConfirmedById(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { 'accountData.id': id },
      {
        $set: {
          'emailConfirmation.isConfirmed': true,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async updateConfirmationCode({
    id,
    code,
    expirationDate,
  }: UpdateConfirmationType) {
    return this.userModel.findOneAndUpdate(
      { 'accountData.id': id },
      {
        $set: {
          'emailConfirmation.confirmationCode': code,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
      { returnDocument: 'after', projection: projectionFields },
    );
  }

  async checkRefreshToken(id: string, revokeToken: RevokedTokenType) {
    const user = await this.userModel.findOne(
      {
        'accountData.id': id,
        revokedTokens: { $elemMatch: revokeToken },
      },
      BASE_PROJECTION,
    );
    return !!user;
  }

  async revokeRefreshToken(id: string, revokeToken: RevokedTokenType) {
    const result = await this.userModel.updateOne(
      { 'accountData.id': id },
      {
        $push: {
          revokedTokens: revokeToken,
        },
      },
      { returnDocument: 'after', projection: projectionFields },
    );
    return !!result.modifiedCount;
  }
}
