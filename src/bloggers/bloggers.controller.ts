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
import { PostsService } from '../posts/posts.service';

import { BloggersService } from './bloggers.service';
import { CreateBloggerPostDto } from './dto/create-blogger-post.dto';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';

@Controller('bloggers')
export class BloggersController {
  constructor(
    private readonly bloggersService: BloggersService,
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @UseGuards(BaseAuthGuard)
  create(@Body() createBloggerDto: CreateBloggerDto) {
    return this.bloggersService.create(createBloggerDto);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.bloggersService.findAll(pageOptionsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blogger = await this.bloggersService.findOne(id);

    if (!blogger) {
      throw new NotFoundException();
    }

    return blogger;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBloggerDto: UpdateBloggerDto,
  ) {
    const blogger = await this.bloggersService.update(id, updateBloggerDto);
    if (!blogger) {
      throw new NotFoundException();
    }

    return blogger;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async remove(@Param('id') id: string) {
    const isDeleted = await this.bloggersService.remove(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return isDeleted;
  }

  @Get(':id/posts')
  async findBloggerPosts(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('id') id: string,
  ) {
    const blogger = await this.bloggersService.findOne(id);

    if (!blogger) {
      throw new NotFoundException();
    }

    return this.postsService.findAll({
      ...pageOptionsDto,
      bloggerId: id,
    });
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BaseAuthGuard)
  async createBloggerPost(
    @Param('id') bloggerId: string,
    @Body() { shortDescription, content, title }: CreateBloggerPostDto,
  ) {
    const blogger = await this.bloggersService.findOne(bloggerId);

    if (!blogger) {
      throw new BadRequestException();
    }

    return this.postsService.create({
      bloggerId,
      shortDescription,
      content,
      title,
    });
  }
}
