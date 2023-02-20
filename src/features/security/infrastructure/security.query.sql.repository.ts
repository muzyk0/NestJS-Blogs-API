import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export abstract class ISecurityQueryRepository {
  abstract findAll(userId: string): Promise<any>;
}

@Injectable()
export class SecurityQuerySqlRepository implements ISecurityQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(userId: string) {
    const userDevices = await this.dataSource.query(
      `SELECT * FROM security WHERE "userId" = $1`,
      [userId],
    );

    return userDevices;
  }
}
