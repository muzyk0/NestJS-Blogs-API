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
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetCurrentJwtContextWithoutAuth } from '../../../common/decorators/get-current-user-without-auth.decorator';
import { GetCurrentJwtContext } from '../../../common/decorators/get-current-user.decorator';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdatePostDto } from '../../posts/application/dto/update-post.dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogPostDto } from '../application/dto/create-blog-post.dto';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { GetBlogsCommand } from '../application/use-cases/get-blogs.handler';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';

import { CreateBlogInput } from './dto/create-blog.input';

@ApiTags('blogger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blogger')
export class BloggerController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({ summary: 'Create new blog' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Returns the newly created blog',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('blogs')
  async create(
    @Body() createBlogInput: CreateBlogInput,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.create({
      ...createBlogInput,
      userId: ctx.user.id,
    });

    return this.blogsQueryRepository.findOne(blog.id);
  }

  @ApiOperation({ summary: 'Delete post specified by id' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Not Found',
  })
  @Get('blogs')
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload,
  ) {
    return this.commandBus.execute(
      new GetBlogsCommand(pageOptionsDto, ctx.user.id),
    );
  }

  @ApiOperation({ summary: 'Update existing Blog by id with InputModel' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description:
      "If user try to update blog that doesn't belong to current user",
  })
  @Put('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @GetCurrentJwtContext() ctx: JwtATPayload,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const blog = await this.blogsService.update(id, updateBlogDto);
    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
    }

    return;
  }

  @ApiOperation({ summary: 'Delete blog specified by id' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Not Found',
  })
  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.findOne(id);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
    }

    return await this.blogsService.remove(id);
  }

  @ApiOperation({ summary: 'Create new post for specific blog' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Returns the newly created post',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description:
      "If user try to add post to blog that doesn't belong to current user",
  })
  @ApiNotFoundResponse({
    status: 404,
    description: "If specific blog doesn't exists",
  })
  @Post('blogs/:id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createBlogPost(
    @Param('id') blogId: string,
    @Body() { shortDescription, content, title }: CreateBlogPostDto,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    const post = await this.postsService.create({
      blogId: blog.id,
      shortDescription,
      content,
      title,
    });

    return this.postsQueryRepository.findOne(post.id);
  }

  @ApiOperation({ summary: 'Update existing post by id with InputModel' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description:
      "If user try to update post that belongs to blog that doesn't belong to current user",
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Not Found',
  })
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogPost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
    }

    const post = await this.postsService.update(postId, blogId, updatePostDto);

    if (!post) {
      throw new NotFoundException();
    }

    return;
  }

  @ApiOperation({ summary: 'Delete post specified by id' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Not Found',
  })
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogPost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.postsService.remove(postId);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }
}
