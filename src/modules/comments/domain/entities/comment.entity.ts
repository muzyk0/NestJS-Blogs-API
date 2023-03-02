import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { Post } from '../../../posts/domain/entities/post.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (post) => post.comments)
  post: User;

  @Column()
  postId: string;
}
