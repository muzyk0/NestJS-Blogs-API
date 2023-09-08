import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateSecurityDto } from '../application/dto/create-security.dto';
import { ISecurityRepository } from '../application/inerfaces/ISecurityRepository';
import { Device } from '../domain/entities/security.entity';

@Injectable()
export class SecuritySqlRepository implements ISecurityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createOrUpdate({
    ip,
    deviceName,
    deviceId,
    userId,
    issuedAt,
    expireAt,
  }: CreateSecurityDto): Promise<Device> {
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

  async remove(deviceId: string): Promise<boolean> {
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

  async getSessionByDeviceId(deviceId: string): Promise<Device | null> {
    const [userDevice] = await this.dataSource.query(
      `SELECT *
       FROM devices
       WHERE "deviceId" = $1`,
      [deviceId],
    );

    return userDevice;
  }

  async removeAllWithoutMyDevice(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
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

  async removeAllDevices(userId: string): Promise<boolean> {
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
