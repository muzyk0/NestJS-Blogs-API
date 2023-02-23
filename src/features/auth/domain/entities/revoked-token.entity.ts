import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../common/base-entity/base.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity()
export class RevokeToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.revokedTokens)
  user: User;

  @Column()
  userAgent: string;

  @Column()
  token: string;
}
