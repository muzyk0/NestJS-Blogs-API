import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ToManyRequestsException } from '../../../common/exceptions/to-many-requests.exception';
import { LimitEnum } from '../dto/limit.enum';
import { LimitsService } from '../limits.service';

@Injectable()
export class LimitsControlWithIpAndLoginGuard implements CanActivate {
  constructor(
    private readonly limitsService: LimitsService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> | null {
    const request = context.switchToHttp().getRequest();
    const { ip, url } = request;
    const login: string | undefined = request.body?.login;

    const maxLimitInterval = 10 * 1000;
    const maxRequest = 5;

    if (this.config.get('IP_RESTRICTION.LIMIT') === LimitEnum.NO_CHECK) {
      return true;
    }

    const deviceName = request.get('User-Agent');

    const isContinue = await this.limitsService.checkLimits(
      { ip, url, login, deviceName },
      maxLimitInterval,
      maxRequest,
    );

    if (!isContinue) {
      throw new ToManyRequestsException();
    }

    return true;
  }
}
