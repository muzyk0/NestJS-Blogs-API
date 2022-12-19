import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { GetLikeDto } from './dto/get-like.dto';
import { Like } from './entity/like.entity';
import { GetCommentLikeByUser } from './interfaces/get-like.interface';
import { LikeStatus } from './interfaces/like-status.enum';
import { LikeInterface } from './interfaces/like.interface';

@Injectable()
export class LikesRepositorySql {
  constructor(private dataSource: DataSource) {}

  async countLikeAndDislikeByCommentId({ parentId }: GetLikeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // TODO: Optimize in 1 query
    const likesCount = await queryRunner.query(
      `
          select COUNT(*) ::int
          from likes
          where "parentId" = $1
            and "status" = $2;

      `,
      [parentId, LikeStatus.LIKE],
    );
    const dislikesCount = await queryRunner.query(
      `
          select COUNT(*) ::int
          from likes
          where "parentId" = $1
            and "status" = $2;

      `,
      [parentId, LikeStatus.DISLIKE],
    );

    await queryRunner.release();

    return {
      likesCount: likesCount[0].count,
      dislikesCount: dislikesCount[0].count,
    };
  }

  async getLikeOrDislike({
    parentId,
    userId,
    parentType,
  }: GetCommentLikeByUser): Promise<Like> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const like: Like[] = await queryRunner.query(
      `
          SELECT *
          FROM likes
          WHERE "parentId" = $1
            AND "userId" = $2
            AND "parentType" = $3
          ORDER BY "createdAt" DESC LIMIT 1
      `,
      [parentId, userId, parentType],
    );

    await queryRunner.release();

    return like[0];
  }

  async create(createLike: LikeInterface): Promise<Like> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query(
      `
          DELETE
          FROM likes
          WHERE "userId" = $1
            AND "parentId" = $2
            AND "parentType" = $3
      `,
      [createLike.userId, createLike.parentId, createLike.parentType],
    );

    const result: Like[] = await queryRunner.query(
      `
          INSERT
          INTO likes (id, "userId", "parentId", status, "parentType")
          VALUES ($1, $2, $3, $4, $5) RETURNING *
      `,
      [
        createLike.id,
        createLike.userId,
        createLike.parentId,
        createLike.status,
        createLike.parentType,
      ],
    );

    await queryRunner.release();

    return result[0];
  }
}
