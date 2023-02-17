import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { RevokeToken } from '../domain/entities/revoked-token.entity';

import { RevokeTokenInput } from './dto/revoke-token.input';

export abstract class IRevokeTokenRepository {
  abstract checkRefreshToken(
    id: string,
    revokeToken: RevokeTokenInput,
  ): Promise<boolean>;

  abstract revokeRefreshToken(
    id: string,
    revokeToken: RevokeTokenInput,
  ): Promise<boolean>;
}

@Injectable()
export class RevokeTokenRepository implements IRevokeTokenRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkRefreshToken(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const revokedTokenCount: number[] = await this.dataSource.query(
      `
        SELECT COUNT(1)
        FROM "revoke_token"
        WHERE "userId" = $1
          AND "token" = $3
          AND "userAgent" = $2

        `,
      [userId, token, userAgent],
    );

    if (revokedTokenCount[0]) {
      return true;
    }

    return false;
  }

  async revokeRefreshToken(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const revokedTokenCount: RevokeToken = await this.dataSource.query(
      `
          INSERT INTO "revoke_token" ("userId", "userAgent", token)
          VALUES ($1, $2, $3)
          RETURNING *
      `,
      [userId, token, userAgent],
    );

    if (revokedTokenCount[0]) {
      return true;
    }

    return false;
  }
}
