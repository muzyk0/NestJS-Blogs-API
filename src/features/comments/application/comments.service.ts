import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { LikeParentTypeEnum } from '../../likes/application/interfaces/like-parent-type.enum';
import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { LikesService } from '../../likes/application/likes.service';
import { formatLikeStatusToInt } from '../../likes/utils/formatters';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { ICommentsService } from '../api/comments.controller';
import { CommentsRepository } from '../infrastructure/comments.repository';

import { CommentDto, IComment } from './dto/comment.dto';
import { CommentInput } from './dto/comment.input';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export interface ICommentsRepository {
  create(createCommentDto: CreateCommentDto): Promise<CommentDto | null>;

  findOne(id: string): Promise<CommentDto>;

  update(updateCommentDto: UpdateCommentDto): Promise<CommentDto>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class CommentsService implements ICommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly likeService: LikesService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const post = await this.postsRepository.findOne(createCommentDto.postId);

    if (!post) {
      return null;
    }

    const newComment: IComment = {
      id: v4(),
      content: createCommentDto.content,
      userId: createCommentDto.userId,
      userLogin: createCommentDto.userLogin,
      postId: post.id,
      createdAt: new Date(),
    };

    return this.commentsRepository.create(newComment);
  }

  async findOne(id: string) {
    return this.commentsRepository.findOne(id);
  }

  async findOneWithUserId(id: string, userId: string) {
    return this.commentsRepository.findOneWithUserId(id, userId);
  }

  async update(id: string, updateCommentDto: CommentInput) {
    const updatedComment = await this.commentsRepository.update({
      id,
      content: updateCommentDto.content,
    });

    if (!updatedComment) {
      return null;
    }

    return updatedComment;
  }

  async remove(id: string) {
    return this.commentsRepository.remove(id);
  }

  async checkCredentials(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      return false;
    }

    return comment.userId === userId;
  }

  async updateCommentLikeStatus(createLike: {
    commentId: string;
    userId: string;
    likeStatus: LikeStringStatus;
  }) {
    const comment = await this.commentsRepository.findOne(createLike.commentId);

    if (!comment) {
      return null;
    }

    const status = formatLikeStatusToInt(createLike.likeStatus);

    return this.likeService.updateLikeStatus({
      parentId: createLike.commentId,
      parentType: LikeParentTypeEnum.COMMENT,
      userId: createLike.userId,
      likeStatus: status,
    });
  }
}
