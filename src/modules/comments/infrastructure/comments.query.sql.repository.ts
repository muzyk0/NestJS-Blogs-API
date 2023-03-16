import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { Like } from '../../likes/domain/entity/like.entity';
import { LikesRepositorySql } from '../../likes/infrastructure/likes.repository.sql';
import { getStringLikeStatus } from '../../likes/utils/formatters';
import {
  CommentDto,
  CommentForBloggerSqlDto,
} from '../application/dto/comment.dto';
import {
  CommentForBloggerViewDto,
  CommentViewDto,
} from '../application/dto/comment.view.dto';

export abstract class ICommentsQueryRepository {
  abstract findOne(id: string, userId?: string): Promise<CommentViewDto>;

  abstract findPostComments(
    findAllCommentsOptions: PageOptionsDto,
    { postId, userId }: { postId: string; userId: string },
  ): Promise<PageDto<CommentViewDto>>;

  abstract getLikesInfo(
    comment: CommentDto,
    userId: string,
  ): Promise<CommentViewDto>;

  abstract findPostCommentsInsideUserBlogs(
    pageOptionsDto: PageOptionsDto,
    userId: string,
  ): Promise<PageDto<unknown>>;
}

@Injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly likesRepositorySql: LikesRepositorySql,
  ) {}

  async findOne(commentId: string, userId?: string): Promise<CommentViewDto> {
    const [comment]: [CommentDto] = await this.dataSource.query(
      `
          SELECT c.*, u.login as "userLogin"
          FROM comments as c
                   LEFT JOIN users u on u.id = c."userId"
                   LEFT JOIN bans AS b on u.id = b."userId"
          where c.id::text = $1
            AND b.banned is null
      `,
      [commentId],
    );

    if (!comment) {
      return;
    }

    return await this.getLikesInfo(comment, userId);
  }

  async findPostComments(
    pageOptionsDto: PageOptionsDto,
    { postId, userId }: { postId: string; userId: string },
  ): Promise<PageDto<CommentViewDto>> {
    const query = `
        WITH comments AS
                 (SELECT c.*, u.login as "userLogin"
                  FROM comments as c
                           lEFT JOIN users as u ON u.id = c."userId"
                  where c."postId"::text = $4
                    )


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

    const comments: { total: number; items?: CommentDto[] } =
      await this.dataSource
        .query(query, [
          pageOptionsDto.sortDirection,
          pageOptionsDto.pageSize,
          pageOptionsDto.skip,
          postId,
        ])
        .then((res) => res[0]?.data);

    const commentsWithLikesInfo: CommentViewDto[] = await Promise.all(
      (comments.items ?? []).map(async (comment) => {
        return this.getLikesInfo(comment, userId);
      }),
    );

    return new PageDto({
      items: commentsWithLikesInfo,
      itemsCount: comments.total,
      pageOptionsDto,
    });
  }

  async getLikesInfo(comment: CommentDto, userId: string) {
    const { likesCount, dislikesCount } =
      await this.likesRepositorySql.countLikeAndDislikeByCommentId({
        parentId: comment.id,
      });

    const myStatus = await this.likesRepositorySql.getLikeOrDislike({
      commentId: comment.id,
      userId: userId,
    });

    return this.mapToViewDto(comment, likesCount, dislikesCount, myStatus);
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

  private mapToViewDto(
    comment: CommentDto,
    likesCount,
    dislikesCount,
    myStatus: Like,
  ): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus: getStringLikeStatus(myStatus.status),
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
      likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
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
