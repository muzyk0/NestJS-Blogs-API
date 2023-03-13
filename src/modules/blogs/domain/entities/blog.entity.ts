import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { BlogsBans } from '../../../bans/domain/entity/blogger-bans.entity';
import { Post } from '../../../posts/domain/entities/post.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('blogs')
export class Blog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({ nullable: true })
  banned: Date | null;

  @ManyToOne(() => User, (user) => user.blogs, { nullable: true })
  user?: User;
  @Column({ nullable: true })
  userId?: string;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Blog[];

  @OneToMany(() => BlogsBans, (blogBans) => blogBans.blog)
  bans: BlogsBans[];
}
