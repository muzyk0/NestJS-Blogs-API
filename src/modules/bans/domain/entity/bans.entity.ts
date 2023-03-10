import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('bans')
export class Bans extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bans)
  user: string;

  @Column({ nullable: true, type: 'uuid', unique: true })
  userId: string;

  @Column({ default: null })
  banned: Date;

  @Column({ nullable: true })
  banReason: string;
}
