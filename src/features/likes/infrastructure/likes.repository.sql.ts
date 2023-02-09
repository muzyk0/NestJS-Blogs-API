import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UsersRepository } from '../../users/infrastructure/users.repository';
import { GetLikeDto } from '../application/dto/get-like.dto';
import { GetCommentLikeByUser } from '../application/interfaces/get-like.interface';
import { LikeStatus } from '../application/interfaces/like-status.enum';
import { LikeInterface } from '../application/interfaces/like.interface';
import { Like } from '../domain/entity/like.entity';

@Injectable()
export class LikesRepositorySql {
  constructor(
    private usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async countLikeAndDislikeByCommentId({ parentId }: GetLikeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const bannedUsersIds = await this.usersRepository
      .findAllWithoutBanned()
      .then((users) => users.map((u) => u.accountData.id))
      .then((users) => users.join(', '));

    // TODO: Optimize in 1 query
    const likesCount = await queryRunner.query(
      `
          select COUNT(*) ::int
          from likes
          where "parentId" = $1
            and "status" = $2
            and "userId" NOT IN ($3);

      `,
      [parentId, LikeStatus.LIKE, bannedUsersIds],
    );
    const dislikesCount = await queryRunner.query(
      `
          select COUNT(*) ::int
          from likes
          where "parentId" = $1
            and "status" = $2
            and "userId" NOT IN ($3);

      `,
      [parentId, LikeStatus.DISLIKE, bannedUsersIds],
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
  }: GetCommentLikeByUser): Promise<Like | undefined> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const like: Like[] = await queryRunner.query(
      `
          SELECT *
          FROM likes
          WHERE "parentId" = $1
            AND "parentType" = $2
            AND "userId" = $3
          ORDER BY "createdAt" DESC
          LIMIT 1
      `,
      [parentId, parentType, userId],
    );

    await queryRunner.release();

    return like[0];
  }

  async getLatestLikes({
    parentId,
    parentType,
    limit = 3,
  }: Pick<GetCommentLikeByUser, 'parentId' | 'parentType'> & {
    limit?: number;
  }): Promise<Like[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const bannedUsersIds = await this.usersRepository
      .findAllWithoutBanned()
      .then((users) => users.map((u) => u.accountData.id))
      .then((users) => users.join(', '));

    const likes: Like[] = await queryRunner.query(
      `
          SELECT *
          FROM likes
          WHERE "parentId" = $1
            AND "parentType" = $2
            AND "status" = $3
            and "userId" NOT IN ($5)
          ORDER BY "createdAt" DESC
          LIMIT $4
      `,
      [parentId, parentType, LikeStatus.LIKE, limit, bannedUsersIds],
    );

    await queryRunner.release();

    return likes;
  }

  async create(createLike: LikeInterface): Promise<Like> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const like: Like[] = await queryRunner.query(
      `
          SELECT id
          FROM likes
          WHERE "userId" = $1
            AND "parentId" = $2
            AND "parentType" = $3
      `,
      [createLike.userId, createLike.parentId, createLike.parentType],
    );

    if (like?.[0]?.id) {
      const updatedLike: Like[] = await queryRunner.query(
        `
            UPDATE likes
            SET status      = $2,
                "updatedAt" = $3
            WHERE "id" = $1;
        `,
        [like[0].id, createLike.status, new Date()],
      );

      await queryRunner.release();

      return updatedLike[0];
    }

    const createdLike: Like[] = await queryRunner.query(
      `
          INSERT
          INTO likes ("userId", "parentId", status, "parentType")
          VALUES ($1, $2, $3, $4)
          RETURNING *
      `,
      [
        createLike.userId,
        createLike.parentId,
        createLike.status ?? LikeStatus.NONE,
        createLike.parentType,
      ],
    );

    await queryRunner.release();

    return createdLike[0];
  }
}
