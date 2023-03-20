import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateSecurityDto } from '../application/dto/create-security.dto';
import { Device } from '../domain/entities/security.entity';

export abstract class ISecurityRepository {
  abstract createOrUpdate(securityDto: CreateSecurityDto): any;

  abstract remove(id: string): Promise<boolean>;

  abstract getSessionByDeviceId(deviceId: string): Promise<Device | undefined>;

  abstract removeAllWithoutMyDevice(userId: string, deviceId: string): any;

  abstract removeAllDevices(userId: string): any;
}

@Injectable()
export class SecurityRepository implements ISecurityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createOrUpdate({
    ip,
    deviceName,
    deviceId,
    userId,
    issuedAt,
    expireAt,
  }: CreateSecurityDto) {
    const [userDevice] = await this.dataSource.query(
      `
          INSERT INTO devices (ip, "deviceName", "deviceId", "userId",
                                "issuedAt", "expireAt")
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT ("userId", "deviceId") DO UPDATE
              SET ip           = $1,
                  "deviceName" = $2,
                  "issuedAt"   = $5,
                  "expireAt"   = $6
          RETURNING *
      `,
      [ip, deviceName, deviceId, userId, issuedAt, expireAt],
    );

    return userDevice;
  }

  async remove(deviceId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_emptyArrayResult, countDeleted] = await this.dataSource.query(
      `DELETE
       FROM devices
       WHERE "deviceId" = $1
      `,
      [deviceId],
    );

    return !!countDeleted;
  }

  async getSessionByDeviceId(deviceId: string): Promise<Device | undefined> {
    const [userDevice] = await this.dataSource.query(
      `SELECT *
       FROM devices
       WHERE "deviceId" = $1`,
      [deviceId],
    );

    return userDevice;
  }

  async removeAllWithoutMyDevice(userId: string, deviceId: string) {
    const result = await this.dataSource.query(
      `DELETE
       FROM devices
       WHERE "userId" = $1
         AND "deviceId" <> $2
      `,
      [userId, deviceId],
    );

    return result;
  }

  async removeAllDevices(userId: string) {
    const result = await this.dataSource.query(
      `DELETE
       FROM devices
       WHERE "userId" = $1
      `,
      [userId],
    );

    return result;
  }
}
