import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';

@Entity('quiz_question')
export class QuizQuestion extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  body: string;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'jsonb', default: [] })
  answers: string[];
}
