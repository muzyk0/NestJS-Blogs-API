import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GetCommentLikeDto } from './dto/get-comment-like.dto';
import { Like } from './entity/like.entity';
import { CommentLikeStatus } from './interfaces/comment-like-status.enum';
import { CommentLikeInterface } from './interfaces/comment-like.interface';
import { GetCommentLikeByUser } from './interfaces/get-comment-like.interface';

@Injectable()
export class CommentLikesRepositorySql {
  constructor(
    @InjectRepository(Like)
    private usersRepository: Repository<Like>,
    private dataSource: DataSource,
  ) {}

  async countLikeAndDislikeByCommentId({ commentId }: GetCommentLikeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // TODO: Optimize in 1 query
    const likesCount = await queryRunner.query(
      `
          select COUNT(*)
          from likes
          where "commentId" = $1
            and "status" = $2;

      `,
      [commentId, CommentLikeStatus.LIKE],
    );
    const dislikesCount = await queryRunner.query(
      `
          select COUNT(*)
          from likes
          where "commentId" = $1
            and "status" = $2;

      `,
      [commentId, CommentLikeStatus.DISLIKE],
    );

    await queryRunner.release();

    return {
      likesCount: likesCount[0].count,
      dislikesCount: dislikesCount[0].count,
    };
  }

  async getLikeOrDislike({
    commentId,
    userId,
  }: GetCommentLikeByUser): Promise<Like> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const like: Like[] = await this.usersRepository.query(
      `
          SELECT *
          FROM likes
          WHERE "commentId" = $1
            AND "userId" = $2
          ORDER BY "createdAt" DESC LIMIT 1
      `,
      [commentId, userId],
    );

    await queryRunner.release();

    return like[0];
  }

  async create(createLike: CommentLikeInterface): Promise<Like> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query(
      `
          DELETE
          FROM likes
          WHERE "userId" = $1
            AND "commentId" = $2
      `,
      [createLike.userId, createLike.commentId],
    );

    const result: Like[] = await queryRunner.query(
      `
          INSERT
          INTO likes (id, "userId", "commentId", status)
          VALUES ($1, $2, $3, $4) RETURNING *
      `,
      [
        createLike.id,
        createLike.userId,
        createLike.commentId,
        createLike.status,
      ],
    );

    await queryRunner.release();

    return result[0];
  }
}
