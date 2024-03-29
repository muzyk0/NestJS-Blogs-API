import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { CreatePostDbDto } from '../application/dto/create-post-db.dto';
import { UpdatePostDto } from '../application/dto/update-post.dto';
import { IPostsRepository } from '../application/interfaces/posts-repository.abstract-class';
import { PostDomain } from '../domain/post.domain';

@Injectable()
export class PostsSqlRepository implements IPostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({
    title,
    shortDescription,
    content,
    blogId,
  }: CreatePostDbDto): Promise<PostDomain> {
    const [post]: [PostDomain] = await this.dataSource.query(
      `
          INSERT INTO posts (title, "shortDescription", content, "blogId")
          values ($1, $2, $3, $4)
          RETURNING *;
      `,
      [title, shortDescription, content, blogId],
    );
    return post;
  }

  async findOne(id: string): Promise<PostDomain | null> {
    const [post]: [PostDomain] = await this.dataSource.query(
      `
          SELECT p.*
          FROM posts as p
          where p.id::text = $1
`,
      [id],
    );

    return post;
  }

  async update(
    id: string,
    { title, shortDescription, content }: UpdatePostDto,
  ): Promise<PostDomain | null> {
    const [[post]]: UpdateOrDeleteEntityRawSqlResponse<PostDomain> =
      await this.dataSource.query(
        `
          UPDATE posts
          SET title = $2,
              "shortDescription" = $3,
              content = $4
          WHERE id::text = $1
          RETURNING *;
      `,
        [id, title, shortDescription, content],
      );

    return post;
  }

  async remove(postId: string): Promise<boolean> {
    const [, deletedCount]: UpdateOrDeleteEntityRawSqlResponse =
      await this.dataSource.query(
        `
          DELETE
          FROM "posts"
          WHERE id::text = $1
      `,
        [postId],
      );
    return !!deletedCount;
  }
}
