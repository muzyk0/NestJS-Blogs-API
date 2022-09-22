import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { PageDto } from '../common/paginator/page.dto';
import {
  FindAllPostsOptions,
  PostsRepository,
} from '../posts/posts.repository';

import {
  CommentsRepository,
  FindAllCommentsOptions,
} from './comments.repository';
import { CommentDto, IComment } from './dto/comment.dto';
import { CommentInput } from './dto/comment.input';
import { CreateCommentDto } from './dto/create-comment.dto';

interface ICommentsService {
  create(createCommentDto: CreateCommentDto): Promise<CommentDto | null>;

  findOne(id: string): Promise<CommentDto>;

  findPostComments(options: FindAllPostsOptions): Promise<PageDto<CommentDto>>;

  update(id: string, updateCommentDto: CommentInput): Promise<CommentDto>;

  remove(id: string): Promise<boolean>;

  checkCredentials(commentId: string, userId: string): Promise<boolean>;
}

@Injectable()
export class CommentsService implements ICommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
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

  async findPostComments(options: FindAllCommentsOptions) {
    return this.commentsRepository.findPostComments(options);
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
}
