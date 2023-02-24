import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SecurityViewModel } from '../application/dto/security.dto';
import { Device } from '../domain/entities/security.entity';

export abstract class ISecurityQueryRepository {
  abstract findAll(userId: string): Promise<any>;
}

@Injectable()
export class SecurityQuerySqlRepository implements ISecurityQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(userId: string) {
    const userDevices = await this.dataSource.query(
      `SELECT ip, "deviceName", "issuedAt", "deviceId"
       FROM security
       WHERE "userId" = $1`,
      [userId],
    );
    return userDevices.map(this.mapToViewModel);
  }

  mapToViewModel(userDevice: Device): SecurityViewModel {
    return {
      ip: userDevice.ip,
      title: userDevice.deviceName,
      lastActiveDate: new Date(userDevice.issuedAt).toISOString(),
      deviceId: userDevice.deviceId,
    };
  }
}
