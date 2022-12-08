import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRecoveryPasswordDto } from './dto/create-recovery-password.dto';
import {
  PasswordRecovery,
  PasswordRecoveryDocument,
} from './schemas/recovery-password.schema';

@Injectable()
export class RecoveryPasswordRepository {
  constructor(
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: Model<PasswordRecoveryDocument>,
  ) {}

  async addPasswordRecovery(
    userId: string,
    passwordRecovery: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryDocument> {
    await this.passwordRecoveryModel.updateMany(
      {
        userId,
        isValid: true,
      },
      {
        $set: {
          isValid: false,
        },
      },
    );

    return this.passwordRecoveryModel.create({
      ...passwordRecovery,
      userId,
    });
  }

  async findByRecoveryCode(recoveryCode: string) {
    return this.passwordRecoveryModel.findOne({
      code: recoveryCode,
      isValid: true,
    });
  }

  async confirmPasswordRecovery(recoveryCode: string) {
    const result = await this.passwordRecoveryModel.updateOne(
      { code: recoveryCode },
      {
        $set: {
          isValid: false,
        },
      },
    );

    return !!result.modifiedCount;
  }
}
