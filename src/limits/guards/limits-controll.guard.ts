import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ToManyRequestsException } from '../../common/exceptions/to-many-requests.exception';
import { LimitsService } from '../limits.service';

@Injectable()
export class LimitsControlGuard implements CanActivate {
  constructor(private limitsService: LimitsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> | null {
    const request = context.switchToHttp().getRequest();
    const { ip, url } = request;

    const maxLimitInterval = 10 * 1000;
    const maxRequest = 5;

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
