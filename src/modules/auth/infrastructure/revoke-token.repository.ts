import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { RevokeTokenInput } from '../application/dto/revoke-token.input';
import { IRevokeTokenRepository } from '../application/revoke-token.abstract-class';
import { RevokeToken } from '../domain/entities/revoked-token.entity';

@Injectable()
export class RevokeTokenRepository implements IRevokeTokenRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(RevokeToken)
    private readonly repo: Repository<RevokeToken>,
  ) {}

  async checkRefreshTokenInBlackList(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const revokeToken = await this.repo.findOne({
      where: { userId, token, userAgent },
    });

    if (!revokeToken) {
      return false;
    }

    return true;
  }

  async revokeRefreshToken(
    userId: string,
    { token, userAgent }: RevokeTokenInput,
  ): Promise<boolean> {
    const revokeToken = await this.repo.create({
      userId,
      token,
      userAgent,
    });

    await this.repo.save(revokeToken);

    if (revokeToken) {
      return true;
    }

    return false;
  }
}
