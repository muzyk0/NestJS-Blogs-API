import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 } from 'uuid';

import { CreateLimitsDto } from './dto/create-limits.dto';
import { LimitDto } from './dto/limitDto';
import { Limit, LimitDocument } from './schemas/limits.schema';

export interface ILimitsRepository {
  addAttempt(requestAttempt: CreateLimitsDto): Promise<boolean>;

  getAttempts(options: {
    ip: string;
    login: string | undefined;
    url: string;
    fromDate: Date;
  }): Promise<number>;

  removeLatestAttempts(toDate: Date): Promise<boolean>;
}

@Injectable()
export class LimitsRepository implements ILimitsRepository {
  constructor(
    @InjectModel(Limit.name) private limitsModel: Model<LimitDocument>,
  ) {}

  async addAttempt({ login, url, ip, deviceName }: CreateLimitsDto) {
    await this.limitsModel.create({
      id: v4(),
      url,
      ip,
      login,
      deviceName,
      createdAt: new Date(),
    });

    return true;
  }

  async getAttempts({
    ip,
    login,
    url,
    fromDate,
  }: {
    ip: string;
    login: string | undefined;
    url: string;
    fromDate: Date;
  }): Promise<number> {
    return this.limitsModel.countDocuments({
      url,
      $or: [{ ip }, { login }],
      createdAt: { $gt: fromDate },
    });
  }

  async removeLatestAttempts(toDate: Date): Promise<boolean> {
    const result = await this.limitsModel.findOneAndDelete({
      createdAt: { $lt: toDate },
    });

    return !!result;
  }
}
