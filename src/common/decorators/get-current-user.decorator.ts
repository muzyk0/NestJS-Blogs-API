import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadWithRt } from '../../features/auth/types/jwt-payload-with-rt.type';
import { JwtATPayload } from '../../features/auth/types/jwtPayload.type';

export const GetCurrentJwtContext = createParamDecorator(
  (data: keyof JwtPayloadWithRt, context: ExecutionContext): JwtATPayload => {
    const request = context.switchToHttp().getRequest();
    const ctx = request.user as JwtATPayload;

    if (!ctx) {
      throw new Error('JWTGuard must be used');
    }

    if (!data) {
      return ctx;
    }

    return ctx[data];
  },
);
