import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../common/base-entity/base.entity';
import { LikeParentTypeEnum } from '../interfaces/like-parent-type.enum';

@Entity('likes')
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  parentId: string;

  @Column({
    type: 'enum',
    enum: LikeParentTypeEnum,
  })
  parentType: string;

  @Column()
  status: number;
}
