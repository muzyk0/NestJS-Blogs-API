import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../../auth/types/jwtPayload.type';

export const GetCurrentJwtContext = createParamDecorator(
  (_: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    const ctx = request.user as JwtPayload;

    if (!ctx) {
      throw new Error('JWTGuard must be used');
    }

    return ctx;
  },
);
