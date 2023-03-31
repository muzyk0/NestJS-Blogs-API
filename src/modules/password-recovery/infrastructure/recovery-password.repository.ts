import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { getCountAfterUpdateOrDeleteForRawSqlResponse } from '../../../shared/utils/get-count-after-update-or-delete-for-raw-sql-response';
import { CreateRecoveryPasswordDto } from '../application/dto/create-recovery-password.dto';
import { IRecoveryPasswordRepository } from '../application/interfaces/recovery-password.abstract';
import { PasswordRecoveryAttempt } from '../domain/entities/password-recovery.entity';

@Injectable()
export class RecoveryPasswordRepository implements IRecoveryPasswordRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PasswordRecoveryAttempt)
    private readonly repo: Repository<PasswordRecoveryAttempt>,
  ) {}

  async addPasswordRecovery(
    userId: string,
    { code }: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryAttempt> {
    await this.repo.update({ userId, isValid: true }, { isValid: false });

    return this.repo.create({ userId, code, isValid: true });
  }

  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecoveryAttempt> {
    return this.repo.findOne({ where: { code: recoveryCode, isValid: true } });
  }

  async confirmPasswordRecovery(recoveryCode: string): Promise<boolean> {
    const result = await this.repo.update(
      { code: recoveryCode, isValid: true },
      { isValid: false, isConfirmed: true },
    );

    const updatedCount = getCountAfterUpdateOrDeleteForRawSqlResponse(
      result.raw,
    );

    return !!updatedCount;
  }
}
