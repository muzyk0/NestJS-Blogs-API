import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IUsersRepository } from '../../users/infrastructure/users.repository.sql';
import { GetLikeDto } from '../application/dto/get-like.dto';
import { GetCommentLikeByUser } from '../application/interfaces/get-like.interface';
import { LikeStatus } from '../application/interfaces/like-status.enum';
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
            AND "userId" = $2
          ORDER BY "createdAt" DESC
          LIMIT 1
      `,
      [commentId, userId],
    );

    return like[0];
  }

  async getLatestLikesForPost({
    postId,
    limit = 3,
  }: Omit<GetCommentLikeByUser, 'commentId'> & {
    limit?: number;
  }): Promise<Like[]> {
    const likes: Like[] = await this.dataSource.query(
      `
          SELECT *
          FROM likes
          WHERE "postId" = $1
            AND "status" = $2
          ORDER BY "createdAt" DESC
          LIMIT $3
      `,
      [postId, LikeStatus.LIKE, limit],
    );

    return likes;
  }

  async createOrUpdatePostLikeStatus(
    createLike: Omit<LikeInterface, 'commentId'>,
  ): Promise<Like | null> {
    const [like]: [Like] = await this.dataSource.query(
      `
          INSERT INTO likes ("userId", "postId", status)
          VALUES ($1, $2, $3)
          ON CONFLICT ("userId", "postId") DO UPDATE
              SET "status"  = $3
          RETURNING *
      `,
      [
        createLike.userId,
        createLike.postId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    return like;
  }

  async createOrUpdateCommentLikeStatus(
    createLike: Omit<LikeInterface, 'postId'>,
  ): Promise<Like | null> {
    const [like]: [Like] = await this.dataSource.query(
      `
          INSERT INTO likes ("userId", "commentId", status)
          VALUES ($1, $2, $3)
          ON CONFLICT ("userId", "commentId") DO UPDATE
              SET "status"  = $3
          RETURNING *
      `,
      [
        createLike.userId,
        createLike.commentId,
        createLike.status ?? LikeStatus.NONE,
      ],
    );

    return like;
  }
}
