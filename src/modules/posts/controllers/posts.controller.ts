import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../../../shared/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContextWithoutAuth } from '../../../shared/decorators/get-current-user-without-auth.decorator';
import { GetCurrentJwtContext } from '../../../shared/decorators/get-current-user.decorator';
import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BansService } from '../../bans/application/bans.service';
import { BlogsService } from '../../blogs/application/blogs.service';
import { CommentsService } from '../../comments/application/comments.service';
import { CommentInput } from '../../comments/application/dto/comment.input';
import { ICommentsQueryRepository } from '../../comments/infrastructure/comments.query.sql.repository';
import { CreateLikeInput } from '../../likes/application/input/create-like.input';
import { PostsService } from '../application/posts.service';
import { IPostsQueryRepository } from '../infrastructure/posts.query.sql.repository';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: IPostsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    private readonly bansService: BansService,
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
  @Get(':id/comments')
  async findPostComments(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Param('id') id: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new NotFoundException({
        field: '',
        message: "Post doesn't exist",
      });
    }

    return this.commentsQueryRepository.findPostComments(
      {
        ...pageOptionsDto,
      },
      {
        postId: id,
        userId: ctx?.user.id,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createPostComment(
    @Param('id') id: string,
    @Body() createCommentDto: CommentInput,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const { id: userId } = ctx.user;

    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new NotFoundException();
    }

    const ban = await this.bansService.getBan({
      userId: userId,
      blogId: post.blogId,
    });

    if (ban) {
      throw new ForbiddenException();
    }

    const { id: commentId } = await this.commentsService.create({
      postId: id,
      content: createCommentDto.content,
      userId,
    });

    const comment = await this.commentsQueryRepository.findOne(
      commentId,
      userId,
    );

    if (!comment) {
      throw new BadRequestException({
        field: '',
        message: "Comment doesn't created",
      });
    }

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @GetCurrentUserId() userId: string,
    @Param('id') postId: string,
    @Body() body: CreateLikeInput,
  ) {
    const comment = await this.postsService.createOrUpdatePostLikeStatus({
      postId,
      userId,
      likeStatus: body.likeStatus,
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return;
  }
}
