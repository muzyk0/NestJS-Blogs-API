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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

import { CommentsService } from './comments.service';
import { CommentInput } from './dto/comment.input';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);

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
}
