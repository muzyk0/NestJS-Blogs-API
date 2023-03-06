import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IUsersRepository } from '../../users/infrastructure/users.repository.sql';
import { GetLikeDto } from '../application/dto/get-like.dto';
import { GetCommentLikeByUser } from '../application/interfaces/get-like.interface';
import { LikeInterface } from '../application/interfaces/like.interface';
import { Like } from '../domain/entity/like.entity';

@Injectable()
export class LikesRepositorySql {
  constructor(
    private usersRepository: IUsersRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async countLikeAndDislikeByCommentId({ parentId }: GetLikeDto) {
    // const bannedUsersIds = await this.usersRepository
    //   .findAllWithoutBanned()
    //   .then((users) => users.map((u) => u.id))
    //   .then((users) => users.join(', '));
    //
    // // TODO: Optimize in 1 query
    // const likesCount = await this.dataSource.query(
    //   `
    //       select COUNT(*) ::int
    //       from likes
    //       where "parentId" = $1
    //         and "status" = $2
    //         and "userId" NOT IN ($3);
    //
    //   `,
    //   [parentId, LikeStatus.LIKE, bannedUsersIds],
    // );
    // const dislikesCount = await this.dataSource.query(
    //   `
    //       select COUNT(*) ::int
    //       from likes
    //       where "parentId" = $1
    //         and "status" = $2
    //         and "userId" NOT IN ($3);
    //
    //   `,
    //   [parentId, LikeStatus.DISLIKE, bannedUsersIds],
    // );

    // return {
    //   likesCount: likesCount[0].count,
    //   dislikesCount: dislikesCount[0].count,
    // };

    return {
      likesCount: 0,
      dislikesCount: 0,
    };
  }

  async getLikeOrDislike({
    commentId,
    userId,
  }: GetCommentLikeByUser): Promise<Like | undefined> {
    const like: Like[] = await this.dataSource.query(
      `
          SELECT *
          FROM likes
          WHERE "commentId" = $1
            AND "userId" = $3
          ORDER BY "createdAt" DESC
          LIMIT 1
      `,
      [commentId, userId],
    );

    return like[0];
  }

  // async getLatestLikes({
  //   parentId,
  //   parentType,
  //   limit = 3,
  // }: Pick<GetCommentLikeByUser, 'parentId' | 'parentType'> & {
  //   limit?: number;
  // }): Promise<Like[]> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //
  //   const bannedUsersIds = await this.usersRepository
  //     .findAllWithoutBanned()
  //     .then((users) => users.map((u) => u.id))
  //     .then((users) => users.join(', '));
  //
  //   const likes: Like[] = await this.dataSource.query(
  //     `
  //         SELECT *
  //         FROM likes
  //         WHERE "parentId" = $1
  //           AND "parentType" = $2
  //           AND "status" = $3
  //           and "userId" NOT IN ($5)
  //         ORDER BY "createdAt" DESC
  //         LIMIT $4
  //     `,
  //     [parentId, parentType, LikeStatus.LIKE, limit, bannedUsersIds],
  //   );
  //
  //   await queryRunner.release();
  //
  //   return likes;
  // }

  async create(createLike: LikeInterface): Promise<Like | null> {
    // const [ban]: [Ban] = await this.dataSource.query(
    //   `
    //       INSERT INTO likes ("userId", "parentId", "parentType", status)
    //       VALUES ($1, $2, $3, $4,)
    //       ON CONFLICT (id) DO UPDATE
    //           SET "isBanned"  = $4,
    //               "banReason" = $5
    //       RETURNING *
    //   `,
    //   [
    //     createLike.userId,
    //     createLike.parentId,
    //     createLike.status ?? LikeStatus.NONE,
    //     createLike.parentType,
    //   ],
    // );
    //
    // return ban;
    //
    // const like: Like[] = await this.dataSource.query(
    //   `
    //       SELECT id
    //       FROM likes
    //       WHERE "userId" = $1
    //         AND "parentId" = $2
    //         AND "parentType" = $3
    //   `,
    //   [createLike.userId, createLike.parentId, createLike.parentType],
    // );
    //
    // if (like?.[0]?.id) {
    //   const updatedLike: Like[] = await this.dataSource.query(
    //     `
    //         UPDATE likes
    //         SET status      = $2,
    //             "updatedAt" = $3
    //         WHERE "id" = $1;
    //     `,
    //     [like[0].id, createLike.status, new Date()],
    //   );
    //
    //   return updatedLike[0];
    // }
    //
    // const createdLike: Like[] = await this.dataSource.query(
    //   `
    //       INSERT
    //       INTO likes ("userId", "parentId", status, "parentType")
    //       VALUES ($1, $2, $3, $4)
    //       RETURNING *
    //   `,
    //   [
    //     createLike.userId,
    //     createLike.parentId,
    //     createLike.status ?? LikeStatus.NONE,
    //     createLike.parentType,
    //   ],
    // );

    return null;
  }
}
