import { Injectable } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import { v4 } from 'uuid';

import { CreateLimitsDto } from './dto/create-limits.dto';
import { LimitDto } from './dto/limitDto';
import { LimitsRepository } from './limits.repository';

export interface ILimitsControl {
  checkLimits(
    requestAttempt: LimitDto,
    limitMs: number,
    maxRequest: number,
  ): Promise<boolean>;
}

@Injectable()
export class LimitsService {
  constructor(private limitsRepository: LimitsRepository) {}

  async checkLimits(
    { ip, url }: CreateLimitsDto,
    limitMs: number,
    maxRequest: number,
  ) {
    const currentDate = new Date();
    const dateFrom = addMilliseconds(currentDate, -limitMs);
    const countRequestAttempts = await this.limitsRepository.getAttempts(
      ip,
      url,
      dateFrom,
    );
    const limitObj: CreateLimitsDto = { ip, url };

    await this.limitsRepository.addAttempt(limitObj);

    if (countRequestAttempts < maxRequest) {
      return true;
    }
    return false;
  }
}
