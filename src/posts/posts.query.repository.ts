import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';
import { LikeParentTypeEnum } from '../likes/interfaces/like-parent-type.enum';
import { LikesRepositorySql } from '../likes/likes.repository.sql';
import { getStringLikeStatus } from '../likes/utils/formatters';
import { UsersRepository } from '../users/users.repository';

import { PostDto } from './dto/post.dto';
import { PostViewDto } from './dto/post.view.dto';
import { Post, PostDocument } from './schemas/posts.schema';

export interface IPostsQueryRepository {
  findAll(options: FindAllPostsOptions): Promise<PageDto<PostDto>>;

  findOne(id: string): Promise<PostViewDto>;
}

export class FindAllPostsOptions extends PageOptionsDto {
  @IsInt()
  @IsOptional()
  blogId?: string;

  @IsInt()
  @IsOptional()
  userId?: string;
}

@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly likesRepositorySql: LikesRepositorySql,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(options: FindAllPostsOptions) {
    const filter = {
      ...(options?.searchNameTerm
        ? { title: { $regex: options.searchNameTerm } }
        : {}),
      ...(options?.blogId ? { blogId: options.blogId } : {}),
    };

    const itemsCount = await this.postModel.countDocuments(filter);

    const posts = await this.postModel
      .find(filter, BASE_PROJECTION, { _id: 0, __v: 0 })
      .skip(options.skip)
      .sort({
        [options.sortBy]: options.sortDirection,
      })
      .limit(options.pageSize)
      .lean();

    const postsWithExtendedLikesInfo: PostViewDto[] = await Promise.all(
      posts.map(async (post) => {
        const { likesCount, dislikesCount } =
          await this.likesRepositorySql.countLikeAndDislikeByCommentId({
            parentId: post.id,
          });

        const myStatus = await this.likesRepositorySql.getLikeOrDislike({
          parentId: post.id,
          parentType: LikeParentTypeEnum.POST,
          userId: options.userId,
        });

        const lastNewestLikes = await this.likesRepositorySql.getLatestLikes({
          parentId: post.id,
          parentType: LikeParentTypeEnum.POST,
          limit: 3,
        });

        const newestLikes = await Promise.all(
          lastNewestLikes.map(async (like) => {
            const user = await this.usersRepository.findOneById(like.userId);

            return {
              userId: like.userId,
              login: user.accountData.login,
              addedAt: like.createdAt.toISOString(),
            };
          }),
        );

        const mappedComment: PostViewDto = {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount,
            dislikesCount,
            myStatus: getStringLikeStatus(myStatus),
            newestLikes: newestLikes,
          },
        };

        return mappedComment;
      }),
    );

    return new PageDto({
      items: postsWithExtendedLikesInfo,
      itemsCount,
      pageOptionsDto: options,
    });
  }

  async findOne(id: string, userId?: string) {
    const post = await this.postModel.findOne(
      { id },
      { projection: BASE_PROJECTION },
    );

    const { likesCount, dislikesCount } =
      await this.likesRepositorySql.countLikeAndDislikeByCommentId({
        parentId: post.id,
      });

    const myStatus = await this.likesRepositorySql.getLikeOrDislike({
      parentId: post.id,
      parentType: LikeParentTypeEnum.POST,
      userId: userId,
    });

    const lastNewestLikes = await this.likesRepositorySql.getLatestLikes({
      parentId: post.id,
      parentType: LikeParentTypeEnum.POST,
      limit: 3,
    });

    const newestLikes = await Promise.all(
      lastNewestLikes.map(async (like) => {
        const user = await this.usersRepository.findOneById(like.userId);

        return {
          userId: like.userId,
          login: user.accountData.login,
          addedAt: like.createdAt.toISOString(),
        };
      }),
    );

    const mappedComment: PostViewDto = {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus: getStringLikeStatus(myStatus),
        newestLikes: newestLikes,
      },
    };

    return mappedComment;
  }
}
