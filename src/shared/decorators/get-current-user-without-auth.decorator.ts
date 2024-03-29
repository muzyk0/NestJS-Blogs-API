import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtATPayload } from '../../modules/auth/application/interfaces/jwtPayload.type';

export const GetCurrentJwtContextWithoutAuth = createParamDecorator(
  (_, context: ExecutionContext): JwtATPayload | null => {
    const request = context.switchToHttp().getRequest();
    const ctx = request.user as JwtATPayload;

    if (!ctx) {
      return null;
    }

    return ctx;
  },
);
