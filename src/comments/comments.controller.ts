import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

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

  // TODO: Bearer Auth
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: CommentInput,
  ) {
    const comment = await this.commentsService.update(id, updateCommentDto);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  // TODO: Bearer Auth
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Res() res: Response, @Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    const isDeleted = await this.commentsService.remove(id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
