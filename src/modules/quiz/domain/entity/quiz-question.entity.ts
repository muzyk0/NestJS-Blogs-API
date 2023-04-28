import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';

@Entity('quiz_question')
export class QuizQuestion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
