import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreatePostDbDto } from '../application/dto/create-post-db.dto';
import { UpdatePostDto } from '../application/dto/update-post.dto';
import { IPostsRepository } from '../application/interfaces/posts-repository.abstract-class';
import { Post } from '../domain/entities/post.entity';
import { PostDomain } from '../domain/post.domain';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly repo: Repository<Post>,
  ) {}

  async create({
    title,
    shortDescription,
    content,
    blogId,
  }: CreatePostDbDto): Promise<PostDomain> {
    const post = await this.repo.create({
      title,
      shortDescription,
      content,
      blogId,
    });

    return this.repo.save(post);
  }

  async findOne(id: string): Promise<PostDomain | null> {
    return this.repo.findOneById(id);
  }

  async update(
    id: string,
    { title, shortDescription, content }: UpdatePostDto,
  ): Promise<PostDomain | null> {
    const post = await this.repo.findOneById(id);

    if (!post) {
      return null;
    }

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;

    return this.repo.save(post);
  }

  async remove(postId: string): Promise<boolean> {
    const post = await this.repo.findOneById(postId);

    if (!post) {
      return false;
    }

    await this.repo.remove(post);

    return true;
  }
}
