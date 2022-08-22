import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../../auth/types/jwtPayload.type';

export const GetCurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.userId) {
      throw new Error('JWTGuard must be used');
    }

    return user.userId;
  },
);
