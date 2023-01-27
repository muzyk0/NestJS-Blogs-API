import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsForUserDto } from '../../../../common/paginator/page-options.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
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
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId, payload }: BanUnbanUserCommand) {
    return this.usersRepository.updateBan(userId, payload);
  }
}
