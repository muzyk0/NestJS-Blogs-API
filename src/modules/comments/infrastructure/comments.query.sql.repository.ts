import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { getStringLikeStatus } from '../../likes/utils/formatters';
import { CommentForBloggerSqlDto } from '../application/dto/comment.dto';
import {
  CommentForBloggerViewDto,
  CommentInputViewDto,
  CommentViewDto,
} from '../application/dto/comment.view.dto';
import { ICommentsQueryRepository } from '../controllers/interfaces/comments-query-repository.abstract-class';

@Injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findOne(commentId: string, userId?: string): Promise<CommentViewDto> {
    const [comment]: [CommentInputViewDto] = await this.dataSource.query(
      `
          SELECT c.id,
                 c.content,
                 c."createdAt",
                 (select row_to_json(row) as "likesInfo"
                  from (select *
                        from (SELECT count(*) as "likesCount"
                              FROM likes l
                                       LEFT join bans ub on ub."userId" = l."userId"
                              WHERE l."commentId" = c.id
                                AND ub.banned IS NULL
                                AND l.status = '1'::likes_status_enum) as "likesCount",
                             (SELECT count(*) as "dislikesCount"
                              FROM likes l
                                       LEFT join bans ub on ub."userId" = l."userId"
                              WHERE l."commentId" = c.id
                                AND ub.banned IS NULL
                                AND l.status = '0'::likes_status_enum) as "dislikesCount",

                             -- if like doesn't exist with postId and userId return -1 like status enum
                             COALESCE((SELECT status as "myStatus"
                                       FROM likes l
                                       WHERE l."commentId" = c.id
                                         AND l."userId" = $2), '-1'::likes_status_enum) as "myStatus") as row),
                 (select row_to_json(row) as "commentatorInfo"
                  from (select u2.id as "userId", u2.login as "userLogin"
                        from users as u2
                        where u2.id = c."userId") as row)
          FROM comments as c
                   LEFT JOIN users u on u.id = c."userId"
                   LEFT JOIN bans AS b on u.id = b."userId"
          where c.id::text = $1
            AND b.banned is null
          group by c.id, c.content,
                   c."createdAt";
      `,
      [commentId, userId],
    );

    if (!comment) {
      return;
    }

    return this.mapToViewDtoForRawSqlMapper(comment);
  }

  async findPostComments(
    pageOptionsDto: PageOptionsDto,
    { postId, userId }: { postId: string; userId: string },
  ): Promise<PageDto<CommentViewDto>> {
    const query = `
        WITH comments AS
                 (SELECT c.id,
                         c.content,
                         c."createdAt",
                         (select row_to_json(row) as "likesInfo"
                          from (select *
                                from (SELECT count(*) as "likesCount"
                                      FROM likes l
                                               LEFT join bans ub on ub."userId" = l."userId"
                                      WHERE l."commentId" = c.id
                                        AND ub.banned IS NULL
                                        AND l.status = '1'::likes_status_enum) as "likesCount",
                                     (SELECT count(*) as "dislikesCount"
                                      FROM likes l
                                               LEFT join bans ub on ub."userId" = l."userId"
                                      WHERE l."commentId" = c.id
                                        AND ub.banned IS NULL
                                        AND l.status = '0'::likes_status_enum) as "dislikesCount",

                                     -- if like doesn't exist with postId and userId return -1 like status enum
                                     COALESCE((SELECT status as "myStatus"
                                               FROM likes l
                                               WHERE l."commentId" = c.id
                                                 AND l."userId" = $5), '-1'::likes_status_enum) as "myStatus") as row),
                         (select row_to_json(row) as "commentatorInfo"
                          from (select u2.id as "userId", u2.login as "userLogin"
                                from users as u2
                                where u2.id = c."userId") as row)
                  FROM comments as c
                           lEFT JOIN users as u ON u.id = c."userId"
                  where c."postId"::text = $4
                  group by c.id, c.content,
                           c."createdAt")


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table comments
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from comments) c(total) on true
              group by c.total) t1;
    `;

    const comments: { total: number; items?: CommentInputViewDto[] } =
      await this.dataSource
        .query(query, [
          pageOptionsDto.sortDirection,
          pageOptionsDto.pageSize,
          pageOptionsDto.skip,
          postId,
          userId,
        ])
        .then((res) => res[0]?.data);

    return new PageDto({
      items: (comments.items ?? []).map(this.mapToViewDtoForRawSqlMapper),
      itemsCount: comments.total,
      pageOptionsDto,
    });
  }

  async findPostCommentsInsideUserBlogs(
    pageOptionsDto: PageOptionsDto,
    userId: string,
  ) {
    const query = `
        WITH comments AS
                 (select c.*,
                         u2.login    as "userLogin",
                         p2.title    as "postTitle",
                         p2."blogId" as "blogId",
                         b2.name     as "blogName"
                  from comments c
                           left join
                       (select p.*, b."userId" as "blogOwnerId"
                        from posts p
                                 left join
                             (select b.*
                              from blogs b
                                       left join users AS u on b."userId" = u.id
                                       LEFT JOIN bans on u.id = b."userId"
                              where b."userId"::text = $4
                                and bans.banned is null) b
                             on p."blogId" = b.id
                        where p."blogId" = b.id) p
                       on c."postId" = p.id
                           left join posts p2 on c."postId" = p2.id
                           left join blogs b2 on p2."blogId" = b2.id
                           left join users u2 on c."userId" = u2.id
                  where c."postId" = p.id)


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table comments
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from comments) c(total) on true
              group by c.total) t1;
    `;

    const comments: { total: number; items?: CommentForBloggerSqlDto[] } =
      await this.dataSource
        .query(query, [
          pageOptionsDto.sortDirection,
          pageOptionsDto.pageSize,
          pageOptionsDto.skip,
          userId,
        ])
        .then((res) => res[0]?.data);

    return new PageDto({
      items: (comments.items ?? []).map(this.mapToBloggerViewDto),
      itemsCount: comments.total,
      pageOptionsDto: pageOptionsDto,
    });
  }

  private mapToViewDtoForRawSqlMapper(
    comment: CommentInputViewDto,
  ): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: getStringLikeStatus(comment.likesInfo.myStatus),
      },
    };
  }

  private mapToBloggerViewDto(
    comment: CommentForBloggerSqlDto,
  ): CommentForBloggerViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStringStatus.NONE,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      postInfo: {
        id: comment.postId,
        title: comment.postTitle,
        blogId: comment.blogId,
        blogName: comment.blogName,
      },
    };
  }
}
