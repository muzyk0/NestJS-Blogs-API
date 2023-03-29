import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../application/dto/update-comment.dto';
import { ICommentsRepository } from '../application/interfaces/comment-repository.abstract-class';
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
          select $1,
                 $2,
                 $3
          where not exists(
                  select * from bloggers_ban_users b where b."userId" = $2::uuid and b.banned is not null
              )
          returning *
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

  async update(
    commentId: string,
    { content }: UpdateCommentDto,
  ): Promise<Comment> {
    const [[comment]]: UpdateOrDeleteEntityRawSqlResponse<Comment> =
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
    const [, deletedCount]: UpdateOrDeleteEntityRawSqlResponse =
      await this.dataSource.query(
        `
            DELETE
            FROM "comments"
            WHERE id::text = $1
        `,
        [commentId],
      );
    return !!deletedCount;
  }
}
