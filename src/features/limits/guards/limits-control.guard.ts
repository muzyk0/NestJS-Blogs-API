import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ToManyRequestsException } from '../../../common/exceptions/to-many-requests.exception';
import { LimitEnum } from '../application/dto/limit.enum';
import { LimitsService } from '../application/limits.service';

@Injectable()
export class LimitsControlGuard implements CanActivate {
  constructor(
    private readonly limitsService: LimitsService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> | null {
    const request = context.switchToHttp().getRequest();
    const { ip, url } = request;

    const maxLimitInterval = 10 * 1000;
    const maxRequest = 5;

    if (this.config.get('IP_RESTRICTION.LIMIT') === LimitEnum.NO_CHECK) {
      return true;
    }

    const isContinue = await this.limitsService.checkLimits(
      { ip, url },
      maxLimitInterval,
      maxRequest,
    );

    if (!isContinue) {
      throw new ToManyRequestsException();
    }

    return true;
  }
}
