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
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth-guard';
import { BaseAuthGuard } from '../auth/guards/base-auth-guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtATPayload } from '../auth/types/jwtPayload.type';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsService } from '../comments/comments.service';
import { CommentInput } from '../comments/dto/comment.input';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContextWithoutAuth } from '../common/decorators/get-current-user-without-auth.decorator';
import { GetCurrentJwtContext } from '../common/decorators/get-current-user.decorator';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { CreateLikeInput } from '../likes/input/create-like.input';

import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.service';

export interface IPostService {
  create(createPostDto: Omit<CreatePostDto, 'id'>): Promise<PostDto>;

  findOne(id: string): Promise<PostDto>;

  update(id: string, updatePostDto: UpdatePostDto): Promise<PostDto>;

  remove(id: string): Promise<boolean>;
}

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  // @UseGuards(BaseAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    const blog = await this.blogsService.findOne(createPostDto.blogId);

    if (!blog) {
      throw new BadRequestException();
    }

    const post = await this.postsService.create(createPostDto);

    return this.postsQueryRepository.findOne(post.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.postsQueryRepository.findAll({
      ...pageOptionsDto,
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

  // @UseGuards(BaseAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const blog = await this.blogsService.findOne(updatePostDto.blogId);

    if (!blog) {
      throw new BadRequestException();
    }

    const post = await this.postsService.update(id, updatePostDto);

    if (!post) {
      throw new NotFoundException();
    }

    return;
  }

  // @UseGuards(BaseAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const isDeleted = await this.postsService.remove(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
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
        postId: id,
      },
      {
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
    const { id: userId, login: userLogin } = ctx.user;

    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new NotFoundException();
    }

    const { id: commentId } = await this.commentsService.create({
      postId: id,
      content: createCommentDto.content,
      userId,
      userLogin,
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
    const comment = await this.postsService.updatePostLikeStatus({
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
