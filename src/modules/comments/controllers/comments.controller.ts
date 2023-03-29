import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../shared/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContextWithoutAuth } from '../../../shared/decorators/get-current-user-without-auth.decorator';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateLikeInput } from '../../likes/application/input/create-like.input';
import { IUsersRepository } from '../../users/infrastructure/users.repository.sql';
import { CommentInput } from '../application/dto/comment.input';
import { UpdateCommentCommand } from '../application/use-cases';
import { LikeCommentCommand } from '../application/use-cases/like-comment.handler';
import { RemoveCommentCommand } from '../application/use-cases/remove-comment.handler';
import { Comment } from '../domain/entities/comment.entity';
import { ICommentsQueryRepository } from '../infrastructure/comments.query.sql.repository';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly commandBus: CommandBus,
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
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @GetCurrentUserId() userId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CommentInput,
  ) {
    return this.commandBus.execute<UpdateCommentCommand, Comment>(
      new UpdateCommentCommand(commentId, userId, updateCommentDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @GetCurrentUserId() userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commandBus.execute<RemoveCommentCommand, void>(
      new RemoveCommentCommand(commentId, userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @GetCurrentUserId() userId: string,
    @Param('id') commentId: string,
    @Body() createLikeInput: CreateLikeInput,
  ) {
    return this.commandBus.execute<LikeCommentCommand, void>(
      new LikeCommentCommand(commentId, userId, createLikeInput),
    );
  }
}
