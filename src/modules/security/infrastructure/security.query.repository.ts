import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SecurityViewModel } from '../application/dto/security.dto';
import { ISecurityQueryRepository } from '../controllers/interfaces/security-query-repository.abstract-class';
import { Device } from '../domain/entities/security.entity';

@Injectable()
export class SecurityQueryRepository implements ISecurityQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findAll(userId: string): Promise<SecurityViewModel[]> {
    const userDevices = await this.deviceRepository.find({ where: { userId } });

    return userDevices.map(this.mapToViewModel);
  }

  mapToViewModel(userDevice: Device): SecurityViewModel {
    return {
      ip: userDevice.ip,
      title: userDevice.deviceName,
      lastActiveDate: userDevice.issuedAt.toISOString(),
      deviceId: userDevice.deviceId,
    };
  }
}
