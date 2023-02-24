import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { RevokeToken } from '../../../auth/domain/entities/revoked-token.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  banned: Date | null;

  @Column({ nullable: true })
  banReason: string | null;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ nullable: true })
  confirmationCode: string | null;

  @Column({ nullable: true })
  expirationDate: Date | null;

  @OneToMany(() => RevokeToken, (photo) => photo.user)
  revokedTokens: RevokeToken[];
}
