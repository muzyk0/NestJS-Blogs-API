import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateSecurityDto } from '../application/dto/create-security.dto';
import { ISecurityRepository } from '../application/inerfaces/ISecurityRepository';
import { Device } from '../domain/entities/security.entity';

@Injectable()
export class SecurityRepository implements ISecurityRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  protected async getDevice(id: string): Promise<Device | null> {
    return await this.deviceRepository.findOneBy({ id });
  }

  async createOrUpdate({
    ip,
    deviceName,
    deviceId,
    userId,
    issuedAt,
    expireAt,
  }: CreateSecurityDto): Promise<Device | null> {
    const result = await this.deviceRepository.upsert(
      {
        ip,
        deviceName,
        deviceId,
        userId,
        issuedAt,
        expireAt,
      },
      ['userId', 'deviceId'],
    );

    return this.getDevice(result.identifiers[0].id);
  }

  async remove(deviceId: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({ where: { deviceId } });

    if (device) {
      await this.deviceRepository.remove(device);
      return true;
    }

    return false;
  }

  async getSessionByDeviceId(deviceId: string): Promise<Device | null> {
    return this.deviceRepository.findOne({ where: { deviceId } });
  }

  async removeAllWithoutMyDevice(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const devices = await this.deviceRepository.find({
      where: { userId, deviceId: Not(deviceId) },
    });
    await this.deviceRepository.remove(devices);

    return true;
  }

  async removeAllDevices(userId: string): Promise<boolean> {
    const devices = await this.deviceRepository.find({
      where: { userId },
    });
    await this.deviceRepository.remove(devices);

    return true;
  }
}
