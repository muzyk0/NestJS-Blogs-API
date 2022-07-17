import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Options, UpdateConfirmationType } from './users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserAccountDBType, UserDocument } from './schemas/users.schema';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: UserAccountDBType) {
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

  async findAll({}: Options): Promise<User[]> {
    return this.userModel.find({});
  }

  async findOneByLogin(login: string): Promise<User> {
    const user = await this.userModel.findOne({ 'accountData.login': login });
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    return this.userModel.findOne({ 'accountData.email': email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ 'accountData.id': id });
    return result.deletedCount === 1;
  }

  async findUneByConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async setIsConfirmed(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { id },
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
}
