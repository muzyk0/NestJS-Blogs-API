import { BanUnbanUserHandler } from './ban-unban-user.handler';
import { CreateUserHandler } from './create-user.handler';
import { GetUsersHandler } from './get-users.handler';
import { RemoveUserHandler } from './remove-user.handler';

export const CommandHandlers = [
  GetUsersHandler,
  RemoveUserHandler,
  CreateUserHandler,
  BanUnbanUserHandler,
  GetUsersHandler,
];
