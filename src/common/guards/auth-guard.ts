import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TestUsersService } from '../../test-users/test-users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private testUserService: TestUsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // throw new UnauthorizedException();
    return true;
  }
}
