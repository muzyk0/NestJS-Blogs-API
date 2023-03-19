import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { Comment } from '../../../comments/domain/entities/comment.entity';
import { Post } from '../../../posts/domain/entities/post.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { LikeStatus } from '../../application/interfaces/like-status.enum';

@Entity('likes')
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes, { nullable: true })
  post: Post;

  @Column('uuid', { nullable: true })
  postId: string;

  @ManyToOne(() => Comment, (comment) => comment.likes, { nullable: true })
  comment: Comment;

  @Column('uuid', { nullable: true })
  commentId: string;

  @Column({
    type: 'enum',
    enum: LikeStatus,
  })
  status: LikeStatus;
}
