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
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContextWithoutAuth } from '../../../common/decorators/get-current-user-without-auth.decorator';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateLikeInput } from '../../likes/application/input/create-like.input';
import { UsersRepository } from '../../users/infrastructure/users.repository.sql';
import { CommentsService } from '../application/comments.service';
import { CommentDto } from '../application/dto/comment.dto';
import { CommentInput } from '../application/dto/comment.input';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';

export interface ICommentsService {
  create(createCommentDto: CreateCommentDto): Promise<CommentDto | null>;

  findOne(id: string): Promise<CommentDto>;

  update(id: string, updateCommentDto: CommentInput): Promise<CommentDto>;

  remove(id: string): Promise<boolean>;

  checkCredentials(commentId: string, userId: string): Promise<boolean>;
}

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersRepository: UsersRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Param('id') id: string,
  ) {
    const comment = await this.commentsQueryRepository.findOne(
      id,
      ctx?.user.id,
    );

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
    @Body() body: CreateLikeInput,
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
