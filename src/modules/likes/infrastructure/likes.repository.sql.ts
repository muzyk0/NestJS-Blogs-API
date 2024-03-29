import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UpdateOrDeleteEntityRawSqlResponse } from '../../../shared/interfaces/row-sql.types';
import { LikeStatus } from '../application/interfaces/like-status.enum';
import { LikeInterface } from '../application/interfaces/like.interface';
import { ILikesRepository } from '../application/interfaces/likes-repository.abstract-class';
import { Like } from '../domain/entity/like.entity';

@Injectable()
export class LikesRepositorySql implements ILikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createOrUpdatePostLikeStatus(
    createLike: Omit<LikeInterface, 'commentId'>,
  ): Promise<Like | null> {
    const [
      updatedLike,
      updatedCount,
    ]: UpdateOrDeleteEntityRawSqlResponse<Like> = await this.dataSource.query(
      `
          UPDATE likes
          SET "status" = $3
          WHERE "userId" = $1
            AND "postId" = $2
          RETURNING *;
          ;
      `,
      [
        createLike.userId,
        createLike.postId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    if (updatedCount) {
      return updatedLike[0];
    }

    const [createdLike]: [Like] = await this.dataSource.query(
      `
          INSERT INTO likes ("userId", "postId", status)
          SELECT $1, $2, $3

          WHERE NOT EXISTS(SELECT 1
                           FROM likes
                           WHERE "userId" = $1
                             AND "postId" = $2)
          RETURNING *
          ;
      `,
      [
        createLike.userId,
        createLike.postId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    return createdLike;
  }

  async createOrUpdateCommentLikeStatus(
    createLike: Omit<LikeInterface, 'postId'>,
  ): Promise<Like | null> {
    const [
      updatedLike,
      updatedCount,
    ]: UpdateOrDeleteEntityRawSqlResponse<Like> = await this.dataSource.query(
      `
          UPDATE likes
          SET "status" = $3
          WHERE "userId" = $1
            AND "commentId" = $2
          RETURNING *;
          ;
      `,
      [
        createLike.userId,
        createLike.commentId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    if (updatedCount) {
      return updatedLike[0];
    }

    const [createdLike]: [Like] = await this.dataSource.query(
      `
          INSERT INTO likes ("userId", "commentId", status)
          SELECT $1, $2, $3

          WHERE NOT EXISTS(SELECT 1
                           FROM likes
                           WHERE "userId" = $1
                             AND "commentId" = $2)
          RETURNING *
          ;
      `,
      [
        createLike.userId,
        createLike.commentId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    return createdLike;
  }
}
