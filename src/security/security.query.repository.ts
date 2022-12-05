import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Security, SecurityDocument } from './schemas/security.schema';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
  ) {}

  async findAll(userId: string) {
    const sessions = await this.securityModel.find({ userId });

    return sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issuedAt,
      deviceId: session.deviceId,
    }));
  }
}
