import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { CommentLikesRepository } from '../comment-likes/comment-likes.repository';
import { getCommentStringLikeStatus } from '../comment-likes/utils/formatters';
import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';
import { Post, PostDocument } from '../posts/schemas/posts.schema';

import { CommentDto } from './dto/comment.dto';
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
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async findOne(id: string): Promise<CommentDto> {
    return this.commentModel.findOne({ id }, projectionFields);
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
          await this.commentLikesRepository.countLikeAndDislikeByCommentId({
            commentId: comment.id,
          });

        const myStatus = await this.commentLikesRepository.getLikeOrDislike({
          commentId: comment.id,
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
            myStatus: getCommentStringLikeStatus(myStatus),
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
