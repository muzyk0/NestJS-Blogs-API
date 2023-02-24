import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { BanTypeEnum } from '../../application/interfaces/ban-type.enum';

@Entity('bans')
export class Ban extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  parentId: string | null;

  @Column({
    type: 'enum',
    enum: BanTypeEnum,
  })
  type: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;
}
