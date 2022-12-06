import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtATPayload } from '../../auth/types/jwtPayload.type';

export const GetCurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtATPayload;

    if (!user?.user.id) {
      throw new Error('JWTGuard must be used');
    }

    return user.user.id;
  },
);
