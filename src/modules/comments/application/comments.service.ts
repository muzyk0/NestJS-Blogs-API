import { Injectable } from '@nestjs/common';

import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { LikesService } from '../../likes/application/likes.service';
import { formatLikeStatusToInt } from '../../likes/utils/formatters';
import { IPostsRepository } from '../../posts/infrastructure/posts.sql.repository';
import { ICommentsService } from '../controllers/comments.controller';
import { Comment } from '../domain/entities/comment.entity';

import { CommentInput } from './dto/comment.input';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export abstract class ICommentsRepository {
  abstract create(createCommentDto: CreateCommentDto): Promise<Comment | null>;

  abstract findOne(id: string): Promise<Comment>;

  abstract findOneWithUserId(id: string, userId: string): Promise<Comment>;

  abstract update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment>;

  abstract remove(id: string): Promise<boolean>;
}

@Injectable()
export class CommentsService implements ICommentsService {
  constructor(
    private readonly commentsRepository: ICommentsRepository,
    private readonly postsRepository: IPostsRepository,
    private readonly likeService: LikesService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const post = await this.postsRepository.findOne(createCommentDto.postId);

    if (!post) {
      return null;
    }

    const newComment: CreateCommentDto = {
      content: createCommentDto.content,
      userId: createCommentDto.userId,
      postId: post.id,
    };

    return this.commentsRepository.create(newComment);
  }

  async findOne(id: string) {
    return this.commentsRepository.findOne(id);
  }

  async findOneWithUserId(id: string, userId: string) {
    return this.commentsRepository.findOneWithUserId(id, userId);
  }

  async update(
    commentId: string,
    updateCommentDto: CommentInput,
  ): Promise<Comment> {
    const updatedComment = await this.commentsRepository.update(commentId, {
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

    return this.likeService.updateCommentLikeStatus({
      commentId: createLike.commentId,
      userId: createLike.userId,
      likeStatus: status,
    });
  }
}
