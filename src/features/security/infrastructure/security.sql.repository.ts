import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateSecurityDto } from '../application/dto/create-security.dto';
import { Security } from '../domain/entities/security.entity';

export abstract class ISecurityRepository {
  abstract create(securityDto: CreateSecurityDto): any;

  abstract remove(id: string): Promise<boolean>;

  abstract getSessionByDeviceId(
    deviceId: string,
  ): Promise<Security | undefined>;

  abstract removeAllWithoutMyDevice(userId: string, deviceId: string): any;

  abstract removeAllDevices(userId: string): any;
}

@Injectable()
export class SecurityRepository implements ISecurityRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({
    ip,
    deviceName,
    deviceId,
    userId,
    issuedAt,
    expireAt,
  }: CreateSecurityDto) {
    const [userDevice] = await this.dataSource.query(
      `
          INSERT INTO security (ip, "deviceName", "deviceId", "userId",
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

    console.log(ip, deviceName, deviceId, userId, issuedAt, expireAt);

    return userDevice;
  }

  async remove(deviceId: string) {
    const result = await this.dataSource.query(
      `DELETE
       FROM security
       WHERE "deviceId" = $1
      `,
      [deviceId],
    );

    return result;
  }

  async getSessionByDeviceId(deviceId: string): Promise<Security | undefined> {
    const [userDevice] = await this.dataSource.query(
      `SELECT *
       FROM security
       WHERE "deviceId" = $1`,
      [deviceId],
    );

    return userDevice;
  }

  async removeAllWithoutMyDevice(userId: string, deviceId: string) {
    const result = await this.dataSource.query(
      `DELETE
       FROM security
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
       FROM security
       WHERE "userId" = $1
      `,
      [userId],
    );

    return result;
  }
}
