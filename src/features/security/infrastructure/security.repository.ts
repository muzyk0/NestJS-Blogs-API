import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SecurityDto } from '../application/dto/security.dto';
import { Security, SecurityDocument } from '../domain/schemas/security.schema';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
  ) {}

  create(securityDto: SecurityDto) {
    return this.securityModel.findOneAndUpdate(
      {
        userId: securityDto.userId,
        deviceId: securityDto.deviceId,
      },
      {
        $set: securityDto,
      },
      { upsert: true, new: true },
    );
  }

  async remove(id: string) {
    const result = await this.securityModel.deleteOne({ deviceId: id });

    return result.deletedCount > 0;
  }

  async getSessionByDeviceId(deviceId: string): Promise<Security | undefined> {
    return this.securityModel.findOne({ deviceId });
  }

  removeAllWithoutMyDevice(userId: string, deviceId: string) {
    return this.securityModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
}
