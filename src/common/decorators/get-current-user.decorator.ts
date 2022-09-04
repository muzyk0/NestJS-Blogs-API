import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadWithRt } from '../../auth/types/jwt-payload-with-rt.type';
import { JwtPayload } from '../../auth/types/jwtPayload.type';

export const GetCurrentJwtContext = createParamDecorator(
  (data: keyof JwtPayloadWithRt, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    const ctx = request.user as JwtPayload;

    if (!ctx) {
      throw new Error('JWTGuard must be used');
    }

    if (!data) {
      return ctx;
    }

    return ctx[data];
  },
);
