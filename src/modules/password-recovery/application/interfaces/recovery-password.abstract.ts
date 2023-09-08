import { PasswordRecoveryAttempt } from '../../domain/entities/password-recovery.entity';
import { CreateRecoveryPasswordDto } from '../dto/create-recovery-password.dto';

export abstract class IRecoveryPasswordRepository {
  abstract addPasswordRecovery(
    userId: string,
    { code }: CreateRecoveryPasswordDto,
  ): Promise<PasswordRecoveryAttempt>;

  abstract findByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecoveryAttempt | null>;

  abstract confirmPasswordRecovery(recoveryCode: string): Promise<boolean>;
}
