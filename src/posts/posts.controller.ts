import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';

import { BloggersService } from '../bloggers/bloggers.service';
import { CommentsService } from '../comments/comments.service';
import { CommentInput } from '../comments/dto/comment.input';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { BaseAuthGuard } from '../common/guards/base-auth-guard';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly bloggersService: BloggersService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(BaseAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    const blogger = await this.bloggersService.findOne(createPostDto.bloggerId);

    if (!blogger) {
      throw new NotFoundException();
    }

    return this.postsService.create(createPostDto);
  }

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(BaseAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const blogger = await this.bloggersService.findOne(updatePostDto.bloggerId);

    if (!blogger) {
      throw new BadRequestException();
    }

    const post = await this.postsService.update(id, updatePostDto);

    if (!post) {
      throw new BadRequestException();
    }

    return;
  }

  @Patch(':id')
  async updatePatch(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const isDeleted = await this.postsService.remove(id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get(':id/comments')
  async findPostComments(@Param('id') id: string, @Res() res: Response) {
    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new BadRequestException({
        field: '',
        message: "Post doesn't exist",
      });
    }

    const comments = await this.commentsService.findPostComments(post.id);

    if (!post) {
      throw new BadRequestException({
        field: '',
        message: "Comments doesn't exist",
      });
    }

    res.status(200).send(comments);
  }

  @Post(':id/comments')
  async createPostComment(
    @Param('id') id: string,
    @Body() createCommentDto: CommentInput,
    @Res() res: Response,
  ) {
    const comment = await this.commentsService.create({
      postId: id,
      content: createCommentDto.content,
      userId: 'userId from ctx',
      userLogin: 'userLogin from ctx',
    });

    if (!comment) {
      throw new BadRequestException({
        field: '',
        message: "Comment doesn't created",
      });
    }

    res.status(HttpStatus.OK).send(comment);
  }
}
