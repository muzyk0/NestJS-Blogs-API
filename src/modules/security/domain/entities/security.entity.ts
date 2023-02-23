import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';

@Entity()
@Unique(['deviceId', 'userId'])
export class Security extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column()
  deviceId: string;

  @Column()
  userId: string;

  @Column()
  issuedAt: Date;

  @Column()
  expireAt: Date;
}
