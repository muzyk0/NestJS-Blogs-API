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

import { BaseAuthGuard } from '../auth/guards/base-auth-guard';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';

import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogsService } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

export interface IBlogService {
  create(createBlogDto: Omit<CreateBlogDto, 'id'>): Promise<BlogDto>;
  findOne(id: string): Promise<BlogDto>;
  update(id: string, updateBlogDto: UpdateBlogDto): Promise<BlogDto>;
  remove(id: string): Promise<boolean>;
}

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @UseGuards(BaseAuthGuard)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.blogsQueryRepository.findAll(pageOptionsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findOne(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogsService.update(id, updateBlogDto);
    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async remove(@Param('id') id: string) {
    const isDeleted = await this.blogsService.remove(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return isDeleted;
  }

  @Get(':id/posts')
  async findBlogPosts(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('id') id: string,
  ) {
    const blog = await this.blogsService.findOne(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return this.postsQueryRepository.findAll({
      ...pageOptionsDto,
      blogId: id,
    });
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BaseAuthGuard)
  async createBlogPost(
    @Param('id') blogId: string,
    @Body() { shortDescription, content, title }: CreateBlogPostDto,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new BadRequestException();
    }

    return this.postsService.create({
      blogId: blogId,
      shortDescription,
      content,
      title,
    });
  }
}
