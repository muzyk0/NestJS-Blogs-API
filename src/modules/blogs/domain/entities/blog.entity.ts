import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { BloggerBanUser } from '../../../bans/domain/entity/blogger-ban-user';
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

  @OneToMany(() => BloggerBanUser, (blogBans) => blogBans.blog)
  bans: BloggerBanUser[];
}
