import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { FilterQuery, Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../common/mongoose/constants';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { PageDto } from '../../../common/paginator/page.dto';
import { Order } from '../../../constants';
import { LikeParentTypeEnum } from '../../likes/application/interfaces/like-parent-type.enum';
import { Like } from '../../likes/domain/entity/like.entity';
import { LikesRepositorySql } from '../../likes/infrastructure/likes.repository.sql';
import { getStringLikeStatus } from '../../likes/utils/formatters';
import { Post, PostDocument } from '../../posts/domain/schemas/posts.schema';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CommentViewDto } from '../application/dto/comment.view.dto';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };

export class FindAllCommentsOptions extends PageOptionsDto {
  constructor(postId: string) {
    super();
    this.postId = postId;
  }

  @IsInt()
  @IsOptional()
  postId?: string;
}

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly likesRepositorySql: LikesRepositorySql,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findOne(id: string, userId?: string): Promise<CommentViewDto> {
    const comment = await this.commentModel.findOne({ id }, projectionFields);

    const user = await this.usersRepository.findOneById(comment.userId);
    if (Boolean(user.accountData.banned)) {
      return;
    }

    if (!comment) {
      return;
    }

    return await this.getLikesInfo(comment, userId);
  }

  async findPostComments(
    findAllCommentsOptions: FindAllCommentsOptions,
    { userId }: { userId: string },
  ): Promise<PageDto<CommentViewDto>> {
    const filter = { postId: findAllCommentsOptions.postId };

    const itemsCount = await this.commentModel.countDocuments(filter);

    const comments = await this.commentModel
      .find(filter, projectionFields)
      .skip(findAllCommentsOptions.skip)
      .sort({
        [findAllCommentsOptions.sortBy]: findAllCommentsOptions.sortDirection,
      })
      .limit(findAllCommentsOptions.pageSize)
      .lean();

    const commentsWithLikesInfo: CommentViewDto[] = await Promise.all(
      comments.map(async (comment) => {
        return this.getLikesInfo(comment, userId);
      }),
    );

    return new PageDto({
      items: commentsWithLikesInfo,
      itemsCount,
      pageOptionsDto: findAllCommentsOptions,
    });
  }

  private async getLikesInfo(comment: Comment, userId: string) {
    const { likesCount, dislikesCount } =
      await this.likesRepositorySql.countLikeAndDislikeByCommentId({
        parentId: comment.id,
      });

    const myStatus = await this.likesRepositorySql.getLikeOrDislike({
      parentId: comment.id,
      parentType: LikeParentTypeEnum.COMMENT,
      userId: userId,
    });

    return this.mapToDto(comment, likesCount, dislikesCount, myStatus);
  }

  private mapToDto(
    comment: Comment,
    likesCount,
    dislikesCount,
    myStatus: Like,
  ): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      postId: comment.postId,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus: getStringLikeStatus(myStatus),
      },
    };
  }

  async findPostCommentsInsideUserBlogs(
    pageOptionsDto: PageOptionsDto,
    // userId: string,
    postIds: string[],
  ) {
    const users = await this.usersRepository
      .findAllWithoutBanned()
      .then((u) => u.map((u) => u.accountData.id));

    // const filter: FilterQuery<CommentDocument> = {
    //   $and: [
    //     { accountData: { $in: ['$userId', users] } },
    //     { $in: ['$postId', postIds] },
    //   ],
    // };
    const filter: FilterQuery<CommentDocument> = {
      postId: { $in: postIds },
      userId: { $in: users },
    };

    const itemsCount = await this.commentModel.countDocuments(filter);

    const comments = await this.commentModel
      .find(filter, projectionFields)
      .skip(pageOptionsDto.skip)
      .sort({
        [pageOptionsDto.sortBy]: pageOptionsDto.sortDirection,
      })
      .limit(pageOptionsDto.pageSize)
      .lean();

    return comments;

    const matchCondition = {
      $expr: {
        $and: [{ $in: ['$userId', users] }, { $in: ['$postId', postIds] }],
      },
    };

    return this._aggregateFindCommentPostsForUser(
      pageOptionsDto,
      matchCondition,
    );
  }

  async _aggregateFindCommentPostsForUser(dto: PageOptionsDto, match: any) {
    const result = await this.commentModel.aggregate([
      {
        $match: match,
      },
      // {
      //   $sort: {
      //     [dto.sortBy]: dto.sortDirection === Order.ASC ? 1 : -1,
      //   },
      // },
      // { $setWindowFields: { output: { totalCount: { $count: {} } } } },
      // {
      //   $skip: dto.pageNumber > 0 ? (dto.pageNumber - 1) * dto.pageSize : 0,
      // },
      // { $limit: dto.pageSize },
      // {
      //   $project: {
      //     _id: 0,
      //     total: '$totalCount',
      //     id: '$id',
      //     content: '$content',
      //     createdAt: '$createdAt',
      //     commentatorInfo: {
      //       userId: '$userId',
      //       userLogin: '$userLogin',
      //     },
      //     postId: '$postId',
      //     blogId: '$blogId',
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'posts',
      //     localField: 'postId',
      //     foreignField: '$id',
      //     as: 'postInfo',
      //     pipeline: [
      //       {
      //         $lookup: {
      //           from: 'blogs',
      //           localField: 'blogId',
      //           foreignField: '$id',
      //           as: 'blog',
      //           pipeline: [],
      //         },
      //       },
      //
      //       {
      //         $project: {
      //           _id: 0,
      //           id: '$id',
      //           title: '$title',
      //           blogId: '$blogId',
      //           blogName: { $first: '$blog' },
      //         },
      //       },
      //       { $set: { blogName: '$blogName.name' } },
      //     ],
      //   },
      // },
      // {
      //   $set: {
      //     postInfo: { $first: '$postInfo' },
      //   },
      // },

      // {
      //   $lookup: {
      //     from: 'likes',
      //     localField: 'id',
      //     foreignField: 'commentId',
      //     as: 'likesInfo.likesCount',
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$status', 'Like'] },
      //               { $in: ['$userId', dto.bannedUsers] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $set: {
      //     'likesInfo.likesCount': {
      //       $size: '$likesInfo.likesCount',
      //     },
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'likes',
      //     localField: 'id',
      //     foreignField: 'commentId',
      //     as: 'likesInfo.myStatus',
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$userId', dto.userId] },
      //               { $in: ['$userId', dto.bannedUsers] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $set: {
      //     'likesInfo.myStatus': {
      //       $ifNull: [
      //         {
      //           $first: '$likesInfo.myStatus.status',
      //         },
      //         'None',
      //       ],
      //     },
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'likes',
      //     localField: 'id',
      //     foreignField: 'commentId',
      //     as: 'likesInfo.dislikesCount',
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$status', 'Dislike'] },
      //               { $in: ['$userId', dto.bannedUsers] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $set: {
      //     'likesInfo.dislikesCount': {
      //       $size: '$likesInfo.dislikesCount',
      //     },
      //   },
      // },

      // {
      //   $group: {
      //     _id: dto.sortBy,
      //     // page: { $first: dto.pageNumber },
      //     // pageSize: { $first: dto.pageSize },
      //     // totalCount: { $first: '$$ROOT.total' },
      //     // pagesCount: {
      //     //   $first: {
      //     //     $ceil: [{ $divide: ['$$ROOT.total', dto.pageSize] }],
      //     //   },
      //     // },
      //     items: { $push: '$$ROOT' },
      //   },
      // },
      // {
      //   $unset: ['items.total', '_id', 'items.blogId', 'items.postId'],
      // },
    ]);
    return result;
  }
}
