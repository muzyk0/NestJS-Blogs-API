import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISecurityRepository } from '../inerfaces/ISecurityRepository';

export class RemoveAllDevicesWithoutMyDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(RemoveAllDevicesWithoutMyDeviceCommand)
export class RemoveAllDevicesWithoutMyDeviceHandler
  implements ICommandHandler<RemoveAllDevicesWithoutMyDeviceCommand, boolean>
{
  constructor(private readonly securityRepository: ISecurityRepository) {}

  async execute({
    deviceId,
    userId,
  }: RemoveAllDevicesWithoutMyDeviceCommand): Promise<boolean> {
    return this.securityRepository.removeAllWithoutMyDevice(userId, deviceId);
  }
}
