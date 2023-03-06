import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('bans')
export class Bans extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bans)
  user: string;

  @Column({ nullable: true, type: 'uuid' })
  userId: string;

  @Column({ default: false })
  banned: boolean;

  @Column({ nullable: true })
  banReason: string;
}
