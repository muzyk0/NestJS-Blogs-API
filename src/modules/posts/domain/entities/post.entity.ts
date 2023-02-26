import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Blog } from '../../../blogs/domain/entities/blog.entity';

@Entity('posts')
export class Post {
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
}
