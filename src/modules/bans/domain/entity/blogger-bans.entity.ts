import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { Blog } from '../../../blogs/domain/entities/blog.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('blogs_bans')
export class BlogsBans extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  banned: Date;

  @Column({ nullable: true })
  banReason: string;

  @ManyToOne(() => User, (user) => user.bans)
  user: string;
  @Column({ nullable: true, type: 'uuid' })
  userId: string;

  @ManyToOne(() => Blog, (blog) => blog.bans)
  blog: string;
  @Column({ nullable: true, type: 'uuid' })
  blogId: string | null;
}
