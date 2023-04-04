import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { CreateRecoveryPasswordDto } from '../application/dto/create-recovery-password.dto';
import { IRecoveryPasswordRepository } from '../application/interfaces/recovery-password.abstract';
import { PasswordRecoveryAttempt } from '../domain/entities/password-recovery.entity';

@Injectable()
export class RecoveryPasswordSqlRepository
  implements IRecoveryPasswordRepository
{
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async addPasswordRecovery(
    userId: string,
    { code }: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryAttempt> {
    await this.dataSource.query(
      `
            UPDATE "password_recovery_attempts"
            SET "isValid" = false
            WHERE "userId" = $1
              AND "isValid" IS TRUE

        `,
      [userId],
    );

    const [attempt]: [PasswordRecoveryAttempt] = await this.dataSource.query(
      `
          INSERT INTO "password_recovery_attempts" ("userId", code, "isValid")
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
          FROM "password_recovery_attempts"
          WHERE "code" = $1
            AND "isValid" is true
      `,
      [recoveryCode],
    );

    return attempt;
  }

  async confirmPasswordRecovery(recoveryCode: string): Promise<boolean> {
    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _,
      updatedCount,
    ]: UpdateOrDeleteEntityRawSqlResponse<PasswordRecoveryAttempt> =
      await this.dataSource.query(
        `
            UPDATE "password_recovery_attempts"
            SET "isValid"     = false,
                "isConfirmed" = true
            WHERE "code" = $1
              AND "isValid" IS TRUE

        `,
        [recoveryCode],
      );

    return !!updatedCount;
  }
}
