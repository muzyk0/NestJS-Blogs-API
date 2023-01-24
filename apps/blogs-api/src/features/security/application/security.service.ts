import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { SecurityRepository } from '../infrastructure/security.repository';

import { CreateSecurityDto } from './dto/create-security.dto';
import { SecurityDto } from './dto/security.dto';

@Injectable()
export class SecurityService {
  constructor(private securityRepository: SecurityRepository) {}

  async create({
    ip,
    deviceId,
    deviceName,
    userId,
    expireAt,
    issuedAt,
  }: CreateSecurityDto) {
    const session: SecurityDto = {
      id: v4(),
      userId,
      ip,
      deviceId,
      deviceName,
      issuedAt,
      expireAt,
    };

    return this.securityRepository.create(session);
  }

  async getSessionByDeviceId(deviceId: string) {
    return this.securityRepository.getSessionByDeviceId(deviceId);
  }

  remove(id: string) {
    return this.securityRepository.remove(id);
  }

  removeAllWithoutMyDevice(userId: string, deviceId: string) {
    return this.securityRepository.removeAllWithoutMyDevice(userId, deviceId);
  }
}
