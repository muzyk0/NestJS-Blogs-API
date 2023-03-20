import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('devices')
@Unique(['deviceId', 'userId'])
export class Device extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column()
  deviceId: string;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  @Column()
  userId: string;

  @Column()
  issuedAt: Date;

  @Column()
  expireAt: Date;
}
