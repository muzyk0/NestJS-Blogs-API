import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { LikeParentTypeEnum } from '../../likes/application/interfaces/like-parent-type.enum';
import { Like } from '../../likes/domain/entity/like.entity';
import { LikesRepositorySql } from '../../likes/infrastructure/likes.repository.sql';
import { getStringLikeStatus } from '../../likes/utils/formatters';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { PostDto } from '../application/dto/post.dto';
import { PostViewDto } from '../application/dto/post.view.dto';
import { Post, PostDocument } from '../domain/schemas/posts.schema';

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
    private readonly blogsRepository: BlogsRepository,
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

    // FIXMe: Remove after switch to SQL
    const blogsForPosts = await this.blogsRepository.findMany(
      posts.map((p) => p.blogId),
    );

    const usersIdsForBannedBlogs = await this.usersRepository
      .findManyByIds(blogsForPosts.map((blog) => blog.userId))
      .then((users) =>
        users.filter((u) => u.accountData.banned).map((u) => u.accountData.id),
      );

    const filter1 = blogsForPosts.filter(
      (blog) => !usersIdsForBannedBlogs.includes(blog.userId),
    );

    const postsWithoutBannedUsers = posts.filter((post) =>
      filter1.some((blog) => blog.id === post.blogId),
    );

    // FIXMe: End remove after switch to SQL

    const postsWithExtendedLikesInfo: PostViewDto[] = await Promise.all(
      postsWithoutBannedUsers.map(async (post) => {
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
    const post = await this.postModel
      .findOne({ id }, { projection: BASE_PROJECTION })
      .lean();

    if (!post) {
      return;
    }

    const blogForPost = await this.blogsRepository.findOne(post.blogId);

    if (blogForPost.userId) {
      const user = await this.usersRepository.findOneById(blogForPost.userId);

      if (user.accountData.banned) {
        return;
      }
    }

    const { likesCount, dislikesCount } =
      await this.likesRepositorySql.countLikeAndDislikeByCommentId({
        parentId: post.id,
      });

    const myStatus: Like | undefined =
      await this.likesRepositorySql.getLikeOrDislike({
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
