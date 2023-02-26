import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsInt, IsOptional } from 'class-validator';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRowSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { CreatePostDbDto } from '../application/dto/create-post-db.dto';
import { CreatePostDto } from '../application/dto/create-post.dto';
import { UpdatePostDto } from '../application/dto/update-post.dto';
import { PostDomain } from '../domain/post.domain';

export class FindAllPostsOptions extends PageOptionsDto {
  @IsInt()
  @IsOptional()
  blogId?: string;
}

export abstract class IPostsRepository {
  abstract create(createPostDto: CreatePostDto): Promise<PostDomain>;

  abstract findOne(postId: string): Promise<PostDomain>;

  abstract update(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDomain>;

  abstract remove(postId: string): Promise<boolean>;

  abstract findManyByBlogsIds(blogsIds: string[]): Promise<PostDomain[]>;
}

@Injectable()
export class PostsRepository implements IPostsRepository {
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

  async findOne(id: string): Promise<PostDomain> {
    const [post]: [PostDomain] = await this.dataSource.query(
      `
          SELECT b.*
          FROM posts as b
          where b.id = $1
`,
      [id],
    );

    return post;
  }

  async update(
    id: string,
    { title, shortDescription, content }: UpdatePostDto,
  ): Promise<PostDomain | null> {
    const [[post]]: UpdateOrDeleteEntityRowSqlResponse<PostDomain> =
      await this.dataSource.query(
        `
          UPDATE posts
          SET title = $2,
              "shortDescription" = $3,
              content = $4
          WHERE id = $1
          RETURNING *;
      `,
        [id, title, shortDescription, content],
      );

    return post;
  }

  async remove(postId: string): Promise<boolean> {
    const [, deletedCount]: UpdateOrDeleteEntityRowSqlResponse =
      await this.dataSource.query(
        `
          DELETE
          FROM "posts"
          WHERE id = $1
      `,
        [postId],
      );
    return !!deletedCount;
  }

  async findManyByBlogsIds(blogsIds: string[]): Promise<PostDomain[]> {
    const posts: PostDomain[] = await this.dataSource.query(
      `
          SELECT p.*
          FROM posts as p
          where p."blogId" IN ($1)
`,
      [blogsIds.join(', ')],
    );

    return posts;
  }
}
