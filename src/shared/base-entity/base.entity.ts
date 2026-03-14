import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class BaseEntity {
  /** Specific usage.
   * Not work with upsert, update and other...
   * Work only with find => create => save and maybe other...
   *  */
  @BeforeUpdate()
  updateDates() {
    this.updatedAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ nullable: true })
  deleted: Date;
}
