import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsInt, IsOptional } from 'class-validator';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { PostWithBlogNameDto } from '../application/dto/post-with-blog-name.dto';
import { PostViewDto } from '../application/dto/post.view.dto';

export abstract class IPostsQueryRepository {
  abstract findAll(
    pageOptionsDto: PageOptionsDto,
    options?: FindAllPostsOptions,
  ): Promise<PageDto<PostViewDto>>;

  abstract findOne(id: string, userId?: string): Promise<PostViewDto>;
}

export class FindAllPostsOptions {
  @IsInt()
  @IsOptional()
  blogId?: string;

  @IsInt()
  @IsOptional()
  userId?: string;
}

@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(
    pageOptionsDto: PageOptionsDto,
    { userId, blogId }: FindAllPostsOptions,
  ) {
    const query = `
        WITH posts AS
                 (SELECT p.*, u.login as "userLogin"
                  FROM posts as p
                           lEFT JOIN users as u ON u.id = $5
                           LEFT JOIN bans AS bans on u.id = bans."userId"
                      lEFT JOIN blogs as b ON p."blogId" = b.id
                  where true
                    AND case
                            when cast($4 as TEXT) IS NOT NULL THEN p.title ILIKE '%' || $4 || '%'
                            ELSE true END
                    AND case
                            when cast($5 as UUID) IS NOT NULL THEN u.id = $5
                            ELSE true END
                    AND case
                            when cast($5 as UUID) IS NOT NULL THEN bans.banned is null
                            ELSE true END
                    AND case
                            when cast($6 as UUID) IS NOT NULL THEN b.banned is null
                            ELSE true END)


        select row_to_json(t1) as data
        from (select c.total,
                     jsonb_agg(row_to_json(sub)) filter (where sub.id is not null) as "items"
              from (table posts
                  order by
                      case when $1 = 'desc' then "${pageOptionsDto.sortBy}" end desc,
                      case when $1 = 'asc' then "${pageOptionsDto.sortBy}" end asc
                  limit $2
                  offset $3) sub
                       right join (select count(*) from posts) c(total) on true
              group by c.total) t1;
    `;

    const posts: { total: number; items?: PostWithBlogNameDto[] } =
      await this.dataSource
        .query(query, [
          pageOptionsDto.sortDirection,
          pageOptionsDto.pageSize,
          pageOptionsDto.skip,
          pageOptionsDto.searchNameTerm,
          userId,
          blogId,
        ])
        .then((res) => res[0]?.data);

    return new PageDto({
      items: (posts.items ?? []).map(this.mapToDtoIterator),
      itemsCount: posts.total,
      pageOptionsDto,
    });
  }

  // TODO: userId for count likes
  async findOne(id: string, userId?: string): Promise<PostViewDto | null> {
    const [post]: [PostWithBlogNameDto] = await this.dataSource.query(
      `
          SELECT p.*, b.name as "blogName"
          FROM posts as p
                   join blogs as b on p."blogId" = b.id
          where p.id::text = $1
            and b.banned is null

      `,
      [id],
    );

    if (!post) {
      return null;
    }

    return this.mapToDtoIterator(post);
  }

  mapToDtoIterator(post: PostWithBlogNameDto): PostViewDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStringStatus.NONE,
        newestLikes: [],
      },
    };
  }
}
