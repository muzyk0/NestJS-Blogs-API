import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISecurityRepository } from '../../../security/infrastructure/security.sql.repository';
import {
  IUsersRepository,
  UsersRepository,
} from '../../infrastructure/users.repository.sql';
import { BanUnbanUserInput } from '../dto/ban-unban-user.input';

export class BanUnbanUserCommand {
  constructor(
    public readonly userId: string,
    public readonly payload: BanUnbanUserInput,
  ) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler
  implements ICommandHandler<BanUnbanUserCommand>
{
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly securityRepository: ISecurityRepository,
  ) {}

  async execute({ userId, payload }: BanUnbanUserCommand) {
    await this.securityRepository.removeAllDevices(userId);
    return this.usersRepository.createOrUpdateBan(userId, payload);
  }
}
