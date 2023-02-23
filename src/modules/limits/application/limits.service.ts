import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { addMilliseconds } from 'date-fns';

import { LimitsRepository } from '../infrastructure/limits.repository';

import { CreateLimitsDto } from './dto/create-limits.dto';

export interface ILimitsService {
  checkLimits(
    requestAttempt: CreateLimitsDto,
    limitMs: number,
    maxRequest: number,
  ): Promise<boolean>;
}

@Injectable()
export class LimitsService implements ILimitsService {
  constructor(private limitsRepository: LimitsRepository) {}

  async checkLimits(
    { ip, login, url, deviceName }: CreateLimitsDto,
    limitMs: number,
    maxRequest: number,
  ) {
    const currentDate = new Date();
    const dateFrom = addMilliseconds(currentDate, -limitMs);
    const countRequestAttempts = await this.limitsRepository.getAttempts({
      ip,
      login,
      url,
      fromDate: dateFrom,
    });
    const limitObj: CreateLimitsDto = { ip, login, url, deviceName };

    await this.limitsRepository.addAttempt(limitObj);

    if (countRequestAttempts < maxRequest) {
      return true;
    }
    return false;
  }

  @Cron('0 * * * * *')
  async removeOldLimits() {
    const maxLimitInterval = 10 * 1000;

    const currentDate = new Date();
    const dateFrom = addMilliseconds(currentDate, -maxLimitInterval);

    await this.limitsRepository.removeLatestAttempts(dateFrom);
  }
}
