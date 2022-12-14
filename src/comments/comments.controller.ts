import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentLikeInput } from '../comment-likes/input/create-comment-like.input';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { CommentInput } from './dto/comment.input';
import { CreateCommentDto } from './dto/create-comment.dto';

export interface ICommentsService {
  create(createCommentDto: CreateCommentDto): Promise<CommentDto | null>;

  findOne(id: string): Promise<CommentDto>;

  update(id: string, updateCommentDto: CommentInput): Promise<CommentDto>;

  remove(id: string): Promise<boolean>;

  checkCredentials(commentId: string, userId: string): Promise<boolean>;
}

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    const comment = await this.commentsQueryRepository.findOne(id, userId);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCommentDto: CommentInput,
  ) {
    const commentIsExist = await this.commentsService.findOne(id);

    if (!commentIsExist) {
      throw new NotFoundException();
    }

    const isAllowed = await this.commentsService.findOneWithUserId(id, userId);

    if (!isAllowed) {
      throw new ForbiddenException();
    }

    const updatedComment = await this.commentsService.update(
      id,
      updateCommentDto,
    );

    if (!updatedComment) {
      throw new NotFoundException();
    }

    return updatedComment;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    const commentIsExist = await this.commentsService.findOne(id);

    if (!commentIsExist) {
      throw new NotFoundException();
    }

    const isAllowed = await this.commentsService.findOneWithUserId(id, userId);

    if (!isAllowed) {
      throw new ForbiddenException();
    }

    const comment = await this.commentsService.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    const isDeleted = await this.commentsService.remove(id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @GetCurrentUserId() userId: string,
    @Param('id') commentId: string,
    @Body() body: CreateCommentLikeInput,
  ) {
    const comment = await this.commentsService.updateCommentLikeStatus({
      commentId,
      userId,
      likeStatus: body.likeStatus,
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return;
  }
}
