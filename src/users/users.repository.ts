import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User, UserAccountDBType, UserDocument } from './schemas/users.schema';
import { Options, UpdateConfirmationType } from './users.interface';

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

    const result = await this.userModel.create(createUserDto);

    console.log(result);

    return this.userModel.findOne(
      { 'accountData.id': createUserDto.accountData.id },
      { projection: { _id: false, __v: false, password: false } },
    );
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
    const filter = {
      ...(pageOptionsDto?.SearchNameTerm
        ? { 'accountData.login': { $regex: pageOptionsDto.SearchNameTerm } }
        : {}),
    };

    const itemsCount = await this.userModel.countDocuments(filter);

    const items = await this.userModel
      .find(filter)
      .skip(pageOptionsDto.skip)
      .limit(pageOptionsDto.PageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto,
    });
  }

  async findOneByLogin(login: string): Promise<User> {
    const user = await this.userModel.findOne({ 'accountData.login': login });
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ 'accountData.email': email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ 'accountData.id': id });
    return result.deletedCount === 1;
  }

  async findOneByConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
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
      { returnDocument: 'after' },
    );
  }

  findOneById(id: string) {
    return this.userModel.findOne({ 'accountData.id': id });
  }
}
