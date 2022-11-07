import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { CreateSecurityDto } from './dto/create-security.dto';
import { SecurityDto } from './dto/security.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { SecurityRepository } from './security.repository';

@Injectable()
export class SecurityService {
  constructor(private securityRepository: SecurityRepository) {}

  async create({
    ip,
    deviceName,
    userId,
    expireAt,
    issuedAt,
  }: CreateSecurityDto) {
    const deviceId: string = v4();

    const session: SecurityDto = {
      id: v4(),
      userId,
      ip,
      deviceName,
      deviceId,
      issuedAt: new Date(),
      expireAt,
    };

    return this.securityRepository.create(session);
  }

  findAll() {
    return `This action returns all security`;
  }

  findOne(id: number) {
    return `This action returns a #${id} security`;
  }

  update(id: number, updateSecurityDto: UpdateSecurityDto) {
    return `This action updates a #${id} security`;
  }

  remove(id: number) {
    return `This action removes a #${id} security`;
  }
}
