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
import { Post, PostDocument } from '../posts/schemas/posts.schema';

import { CommentViewDto } from './dto/comment.view.dto';
import { Comment, CommentDocument } from './schemas/comments.schema';

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
  ) {}

  async findOne(id: string, userId?: string): Promise<CommentViewDto> {
    const comment = await this.commentModel.findOne({ id }, projectionFields);

    const { likesCount, dislikesCount } =
      await this.likesRepositorySql.countLikeAndDislikeByCommentId({
        parentId: comment.id,
      });

    const myStatus = await this.likesRepositorySql.getLikeOrDislike({
      parentId: comment.id,
      parentType: LikeParentTypeEnum.COMMENT,
      userId: userId,
    });

    const mappedComment: CommentViewDto = {
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

    return mappedComment;
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
        const { likesCount, dislikesCount } =
          await this.likesRepositorySql.countLikeAndDislikeByCommentId({
            parentId: comment.id,
          });

        const myStatus = await this.likesRepositorySql.getLikeOrDislike({
          parentId: comment.id,
          parentType: LikeParentTypeEnum.COMMENT,
          userId: userId,
        });

        const mappedComment: CommentViewDto = {
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

        return mappedComment;
      }),
    );

    return new PageDto({
      items: commentsWithLikesInfo,
      itemsCount,
      pageOptionsDto: findAllCommentsOptions,
    });
  }
}
