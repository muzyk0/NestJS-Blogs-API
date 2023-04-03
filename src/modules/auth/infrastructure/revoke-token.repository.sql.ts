import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { RevokeTokenInput } from '../application/dto/revoke-token.input';
import { IRevokeTokenRepository } from '../application/revoke-token.abstract-class';
import { RevokeToken } from '../domain/entities/revoked-token.entity';

@Injectable()
export class RevokeTokenSqlRepository implements IRevokeTokenRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkRefreshTokenInBlackList(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const [revokedTokenCount]: [{ count: string }] =
      await this.dataSource.query(
        `
        SELECT COUNT(1) as count
        FROM "revoke_tokens"
        WHERE "userId" = $1
          AND "token" = $2
          AND "userAgent" = $3;
        `,
        [userId, token, userAgent],
      );

    if (Number(revokedTokenCount.count)) {
      return true;
    }

    return false;
  }

  async revokeRefreshToken(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const revokedTokenCount: [RevokeToken] = await this.dataSource.query(
      `
          INSERT INTO "revoke_tokens" ("userId", token, "userAgent")
          VALUES ($1, $2, $3)
          RETURNING *
      `,
      [userId, token, userAgent],
    );

    if (revokedTokenCount) {
      return true;
    }

    return false;
  }
}
