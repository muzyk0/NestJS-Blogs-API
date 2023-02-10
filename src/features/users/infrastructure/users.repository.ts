import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { BanUnbanUserInput } from '../application/dto/ban-unban-user.input';
import { UpdateConfirmationType } from '../application/interfaces/users.interface';
import { RevokedTokenType } from '../domain/schemas/revoked-tokens.schema';
import {
  User,
  UserAccountDBType,
  UserDocument,
} from '../domain/schemas/users.schema';

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

  async findOneByLoginOrEmail(
    loginOrEmail: string,
    withBanned?: false,
  ): Promise<User> {
    const filter: FilterQuery<UserDocument> = {
      ...(withBanned ? { 'accountData.banned': { $exists: true } } : {}),
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    };
    return this.userModel.findOne(filter, BASE_PROJECTION).lean();
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

  async findOneById(id: string): Promise<UserAccountDBType | null> {
    return this.userModel
      .findOne({ 'accountData.id': id }, BASE_PROJECTION)
      .lean();
  }

  async findManyByIds(ids: string[]): Promise<UserAccountDBType[] | null> {
    const users = await this.userModel
      .find({ 'accountData.id': { $in: ids }, BASE_PROJECTION })
      .lean();

    return users;
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

  async updateUserPassword({ password, id }: { password: string; id: string }) {
    const user = await this.userModel.updateOne(
      { 'accountData.id': id },
      {
        $set: {
          'accountData.password': password,
        },
      },
      { returnDocument: 'after', projection: projectionFields },
    );
    return !!user.modifiedCount;
  }

  async updateBan(id: string, payload: BanUnbanUserInput) {
    const user = await this.userModel.updateOne(
      { 'accountData.id': id },
      {
        $set: {
          'accountData.banned': payload.isBanned ? new Date() : null,
          'accountData.banReason': payload.isBanned ? payload.banReason : null,
        },
      },
      { returnDocument: 'after', projection: projectionFields },
    );
    return !!user.modifiedCount;
  }

  async findByIds(ids: string[]): Promise<UserAccountDBType[]> {
    return this.userModel
      .find({
        'accountData.id': { $in: ids },
      })
      .lean();
  }

  async findAllWithoutBanned() {
    return this.userModel.find({ 'accountData.banned': null });
  }
}
