import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRowSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { ICommentsRepository } from '../application/comments.service';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../application/dto/update-comment.dto';
import { Comment } from '../domain/entities/comment.entity';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({
    content,
    userId,
    postId,
  }: CreateCommentDto): Promise<Comment | null> {
    const [comment]: [Comment] = await this.dataSource.query(
      `
          INSERT INTO comments (content, "userId", "postId")
          values ($1, $2, $3)
          RETURNING *;
      `,
      [content, userId, postId],
    );
    return comment;
  }

  async findOne(id: string): Promise<Comment> {
    const [comment]: [Comment] = await this.dataSource.query(
      `
          SELECT *
          FROM comments
          where id::text = $1
`,
      [id],
    );

    return comment;
  }

  async findOneWithUserId(id: string, userId: string): Promise<Comment> {
    const [comment]: [Comment] = await this.dataSource.query(
      `
          SELECT *
          FROM comments
          where id::text = $1
                AND "userId"::text = $2
`,
      [id, userId],
    );

    return comment;
  }

  async update(
    commentId: string,
    { content }: UpdateCommentDto,
  ): Promise<Comment> {
    const [[comment]]: UpdateOrDeleteEntityRowSqlResponse<Comment> =
      await this.dataSource.query(
        `
          UPDATE comments
          SET content = $2
          WHERE id::text = $1
          RETURNING *;
      `,
        [commentId, content],
      );

    return comment;
  }

  async remove(commentId: string): Promise<boolean> {
    const [, deletedCount]: UpdateOrDeleteEntityRowSqlResponse =
      await this.dataSource.query(
        `
          DELETE
          FROM "posts"
          WHERE id::text = $1
      `,
        [commentId],
      );
    return !!deletedCount;
  }
}
