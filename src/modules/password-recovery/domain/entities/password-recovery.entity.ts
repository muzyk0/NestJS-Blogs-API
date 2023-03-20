import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('password_recovery_attempts')
export class PasswordRecoveryAttempt extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.passwordRecoveryAttempts)
  user: User;

  @Column()
  userId: string;

  @Column()
  code: string;

  @Column()
  isValid: boolean;
}
