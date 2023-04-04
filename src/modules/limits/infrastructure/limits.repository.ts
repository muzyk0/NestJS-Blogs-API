import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { CreateLimitsDto } from '../application/dto/create-limits.dto';
import { LimitDto } from '../application/dto/limitDto';

export abstract class ILimitsRepository {
  abstract addAttempt(requestAttempt: CreateLimitsDto): Promise<boolean>;

  abstract getAttempts(options: {
    ip: string;
    login: string | undefined;
    url: string;
    fromDate: Date;
  }): Promise<number>;

  abstract removeLatestAttempts(toDate: Date): Promise<boolean>;
}

@Injectable()
export class LimitsRepository implements ILimitsRepository {
  limitsItems: LimitDto[] = [];

  async addAttempt({ login, url, ip, deviceName }: CreateLimitsDto) {
    const limit = {
      id: v4(),
      url,
      ip,
      login,
      deviceName,
      createdAt: new Date(),
    };

    this.limitsItems.push(limit);
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
    const items = this.limitsItems.filter(
      (item) =>
        item.url === url &&
        (item.ip === ip || item.login === login) &&
        // item.ip === ip &&
        item.createdAt > fromDate,
    );

    return items.length;
  }

  async removeLatestAttempts(toDate: Date): Promise<boolean> {
    this.limitsItems = this.limitsItems.filter(
      (item) => item.createdAt > toDate,
    );

    return true;
  }
}
