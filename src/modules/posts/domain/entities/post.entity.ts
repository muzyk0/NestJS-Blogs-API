import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { RevokeToken } from '../../../auth/domain/entities/revoked-token.entity';
import { Blog } from '../../../blogs/domain/entities/blog.entity';
import { Comment } from '../../../comments/domain/entities/comment.entity';
import { Like } from '../../../likes/domain/entity/like.entity';
import { Device } from '../../../security/domain/entities/security.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog: Blog;

  @Column()
  blogId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}
