import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IUserBanRepository } from '../../../bans/infrastructure/user-bans.repository.';
import { ISecurityRepository } from '../../../security/infrastructure/security.sql.repository';
import { IUsersRepository } from '../../infrastructure/users.repository.sql';
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
    private readonly UserBanRepository: IUserBanRepository,
    private readonly securityRepository: ISecurityRepository,
  ) {}

  async execute({ userId, payload }: BanUnbanUserCommand): Promise<boolean> {
    const isUserBanned = await this.UserBanRepository.createOrUpdateBan(
      userId,
      payload,
    );
    if (!isUserBanned) {
      throw new BadRequestException();
    }

    await this.securityRepository.removeAllDevices(userId);

    return true;
  }
}
