import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { RevokeToken } from '../../../auth/domain/entities/revoked-token.entity';
import { Blog } from '../../../blogs/domain/entities/blog.entity';
import { Comment } from '../../../comments/domain/entities/comment.entity';
import { Device } from '../../../security/domain/entities/security.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  banned: Date | null;

  @Column({ nullable: true })
  banReason: string | null;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ nullable: true })
  confirmationCode: string | null;

  @Column({ nullable: true })
  expirationDate: Date | null;

  @OneToMany(() => RevokeToken, (photo) => photo.user)
  revokedTokens: RevokeToken[];

  @OneToMany(() => Device, (device) => device.user)
  devices: RevokeToken[];

  @OneToMany(() => Blog, (blog) => blog.user, { nullable: true })
  blogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
