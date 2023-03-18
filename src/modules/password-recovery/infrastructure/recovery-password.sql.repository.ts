import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { CreateRecoveryPasswordDto } from '../application/dto/create-recovery-password.dto';
import { PasswordRecoveryAttempt } from '../domain/entities/password-recovery.entity';

export abstract class IRecoveryPasswordRepository {
  abstract addPasswordRecovery(
    userId: string,
    { isValid, code }: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryAttempt>;

  abstract findByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecoveryAttempt>;

  abstract confirmPasswordRecovery(recoveryCode: string): Promise<boolean>;
}

@Injectable()
export class RecoveryPasswordRepository implements IRecoveryPasswordRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async addPasswordRecovery(
    userId: string,
    { isValid, code }: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryAttempt> {
    const [
      _attempt,
      updatedCount,
    ]: UpdateOrDeleteEntityRawSqlResponse<PasswordRecoveryAttempt> =
      await this.dataSource.query(
        `
            UPDATE "passwordRecoveryAttempts"
            SET "isValid" = false
            WHERE "userId" = $1
              AND "isValid" IS TRUE

        `,
        [userId],
      );

    const [attempt]: [PasswordRecoveryAttempt] = await this.dataSource.query(
      `
          INSERT INTO "passwordRecoveryAttempts" ("userId", code, "isValid")
          VALUES ($1, $2, true)
          RETURNING *

      `,
      [userId, code],
    );
    return attempt;
  }

  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecoveryAttempt> {
    const [attempt]: [PasswordRecoveryAttempt] = await this.dataSource.query(
      `
          SELECT *
          FROM "passwordRecoveryAttempts"
          WHERE "code" = $1
            AND "isValid" is true
      `,
      [recoveryCode],
    );

    return attempt;
  }

  async confirmPasswordRecovery(recoveryCode: string): Promise<boolean> {
    const [
      attempt,
      updatedCount,
    ]: UpdateOrDeleteEntityRawSqlResponse<PasswordRecoveryAttempt> =
      await this.dataSource.query(
        `
            UPDATE "passwordRecoveryAttempts"
            SET "isValid" = false
            WHERE "code" = $1
              AND "isValid" IS TRUE

        `,
        [recoveryCode],
      );

    return !!updatedCount;
  }
}
