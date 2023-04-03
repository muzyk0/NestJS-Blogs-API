import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../../../../shared/base-entity/base.entity';
import { RevokeToken } from '../../../auth/domain/entities/revoked-token.entity';
import { Bans } from '../../../bans/domain/entity/bans.entity';
import { Blog } from '../../../blogs/domain/entities/blog.entity';
import { Comment } from '../../../comments/domain/entities/comment.entity';
import { Like } from '../../../likes/domain/entity/like.entity';
import { PasswordRecoveryAttempt } from '../../../password-recovery/domain/entities/password-recovery.entity';
import { Device } from '../../../security/domain/entities/security.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

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

  @OneToMany(() => Like, (like) => like.user)
  likes: Comment[];

  @OneToMany(() => Bans, (bans) => bans.user, { nullable: true })
  bans: Bans[] | null;

  @OneToMany(
    () => PasswordRecoveryAttempt,
    (passwordRecoveryAttempt) => passwordRecoveryAttempt.user,
  )
  passwordRecoveryAttempts: Bans[];
}
