import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISecurityRepository } from '../../infrastructure/security.sql.repository';

export class RemoveSessionDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(RemoveSessionDeviceCommand)
export class RemoveSessionDeviceHandler
  implements ICommandHandler<RemoveSessionDeviceCommand, boolean>
{
  constructor(private readonly securityRepository: ISecurityRepository) {}

  async execute({
    deviceId,
    userId,
  }: RemoveSessionDeviceCommand): Promise<boolean> {
    const session = await this.securityRepository.getSessionByDeviceId(
      deviceId,
    );

    if (!session) {
      throw new NotFoundException();
    }

    if (session.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.securityRepository.remove(deviceId);
  }
}
