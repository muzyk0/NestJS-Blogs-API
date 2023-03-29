import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../shared/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContextWithoutAuth } from '../../../shared/decorators/get-current-user-without-auth.decorator';
import { GetCurrentJwtContext } from '../../../shared/decorators/get-current-user.decorator';
import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentInput } from '../../comments/application/dto/comment.input';
import { GetPostCommentsCommand } from '../../comments/application/use-cases';
import { CreatePostCommentCommand } from '../../comments/application/use-cases/create-post-comments.handler';
import { CreateLikeInput } from '../../likes/application/input/create-like.input';
import { LikePostCommand } from '../application/use-cases/like-post.handler';
import { IPostsQueryRepository } from '../infrastructure/posts.query.sql.repository';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: IPostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.postsQueryRepository.findAll(pageOptionsDto, {
      userId: ctx?.user?.id,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Param('id') id: string,
  ) {
    const post = await this.postsQueryRepository.findOne(id, ctx?.user.id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @UseGuards(AuthGuard)
  @Get(':postId/comments')
  async findPostComments(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Param('postId') postId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.commandBus.execute(
      new GetPostCommentsCommand(pageOptionsDto, postId, ctx?.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  async createPostComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CommentInput,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    return this.commandBus.execute(
      new CreatePostCommentCommand(createCommentDto, postId, ctx?.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @GetCurrentUserId() userId: string,
    @Param('id') postId: string,
    @Body() createLikeInput: CreateLikeInput,
  ) {
    return this.commandBus.execute<LikePostCommand, void>(
      new LikePostCommand(postId, userId, createLikeInput),
    );
  }
}
