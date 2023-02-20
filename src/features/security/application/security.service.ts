import { Injectable } from '@nestjs/common';

import { ISecurityRepository } from '../infrastructure/security.sql.repository';

import { CreateSecurityDto } from './dto/create-security.dto';

@Injectable()
export class SecurityService {
  constructor(private securityRepository: ISecurityRepository) {}

  async create({
    ip,
    deviceId,
    deviceName,
    userId,
    expireAt,
    issuedAt,
  }: CreateSecurityDto) {
    const session: CreateSecurityDto = {
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
