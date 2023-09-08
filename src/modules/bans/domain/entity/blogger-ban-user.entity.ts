import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { Blog } from '../../../blogs/domain/entities/blog.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('bloggers_ban_users')
export class BloggerBanUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  banned: Date;

  @Column({ nullable: true })
  banReason: string;

  @ManyToOne(() => User, (user) => user.bans)
  user: string;
  @Column()
  userId: string;

  @ManyToOne(() => Blog, (blog) => blog.bans)
  blog: string;
  @Column()
  blogId: string | null;
}
