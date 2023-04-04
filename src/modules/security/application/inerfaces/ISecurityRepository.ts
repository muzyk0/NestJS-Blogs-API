import { Device } from '../../domain/entities/security.entity';
import { CreateSecurityDto } from '../dto/create-security.dto';

export abstract class ISecurityRepository {
  abstract createOrUpdate(securityDto: CreateSecurityDto): Promise<Device>;

  abstract remove(id: string): Promise<boolean>;

  abstract getSessionByDeviceId(deviceId: string): Promise<Device | undefined>;

  abstract removeAllWithoutMyDevice(
    userId: string,
    deviceId: string,
  ): Promise<boolean>;

  abstract removeAllDevices(userId: string): Promise<boolean>;
}
