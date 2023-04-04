import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { CreateBlogDto } from '../application/dto/create-blog.dto';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { IBlogsRepository } from '../application/interfaces/blog.abstract-class';
import { Blog } from '../domain/entities/blog.entity';

@Injectable()
export class BlogsSqlRepository implements IBlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({ name, description, websiteUrl, userId }: CreateBlogDto) {
    const [blog]: [Blog] = await this.dataSource.query(
      `
          INSERT INTO blogs (name, description, "websiteUrl", "userId")
          values ($1, $2, $3, $4)
          RETURNING *;
      `,
      [name, description, websiteUrl, userId],
    );
    return blog;
  }

  async findOne(id: string): Promise<Blog | null> {
    const [blog]: [Blog] = await this.dataSource.query(
      `
          SELECT b.*
          FROM blogs as b
          where b.id::text = $1
`,
      [id],
    );

    return blog;
  }

  async update(
    id: string,
    { name, description, websiteUrl }: UpdateBlogDto,
  ): Promise<Blog> {
    const [[blog]]: UpdateOrDeleteEntityRawSqlResponse<Blog> =
      await this.dataSource.query(
        `
          UPDATE blogs
          SET name = $2,
              description = $3,
              "websiteUrl" = $4
          WHERE id::text = $1
          RETURNING *;
      `,
        [id, name, description, websiteUrl],
      );

    return blog;
  }

  async remove(id: string): Promise<boolean> {
    const [, deletedCount]: UpdateOrDeleteEntityRawSqlResponse =
      await this.dataSource.query(
        `
          DELETE
          FROM "blogs"
          WHERE id::text = $1
      `,
        [id],
      );
    return !!deletedCount;
  }

  async bindBlogOnUser(blogId: string, userId: string): Promise<Blog> {
    const [blog]: [Blog] = await this.dataSource.query(
      `
          UPDATE blogs
          SET "userId" = $2
          WHERE id::text = $1
            and "userId" IS NULL
          RETURNING *;
      `,
      [blogId, userId],
    );

    return blog;
  }

  async updateBanStatus(blogId: string, isBanned: boolean): Promise<Blog> {
    const banned = isBanned ? new Date() : null;
    const [blog]: [Blog] = await this.dataSource.query(
      `
          UPDATE "blogs"
          SET "banned"    = $2
          WHERE id::text = $1
          RETURNING *
      `,
      [blogId, banned],
    );
    return blog;
  }
}
