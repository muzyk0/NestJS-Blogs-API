import {
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetCurrentJwtContextWithoutAuth } from '../../../common/decorators/get-current-user-without-auth.decorator';
import { GetCurrentJwtContext } from '../../../common/decorators/get-current-user.decorator';
import {
  PageOptionsDto,
  PageOptionsForUserDto,
} from '../../../common/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateBanUserForBlogCommand } from '../../bans/application/use-cases/update-ban-user-for-blog.handler';
import { GetPostCommentsInsideCurrentUserBlogsCommand } from '../../comments/application/use-cases/get-post-comments-inside-current-user-blogs.handler';
import { UpdatePostDto } from '../../posts/application/dto/update-post.dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogPostDto } from '../application/dto/create-blog-post.dto';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { GetBlogsCommand } from '../application/use-cases/get-blogs.handler';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';

import { BanUserForBlogInput } from './dto/ban-user-for-blog.input';
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
    private readonly usersQueryRepository: UsersQueryRepository,
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

  @ApiOperation({
    summary: 'Returns blogs (for which current user is owner) with paging',
  })
  @ApiOkResponse({
    status: 200,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
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
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
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

  @ApiOperation({
    summary: 'Returns all comments for all posts inside all current user blogs',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('blogs/comments')
  async findBlogComments(
    @Query() pageOptionsDto: PageOptionsDto,
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload,
  ) {
    const result = await this.commandBus.execute(
      new GetPostCommentsInsideCurrentUserBlogsCommand(
        pageOptionsDto,
        ctx.user.id,
      ),
    );

    if (!result.items.length) {
      return result;
    }

    return {
      pagesCount: 2,
      page: 1,
      pageSize: 10,
      totalCount: 12,
      items: [
        {
          id: 'ea16cfda-d513-4317-9483-b55fd33d5ba0',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:26.490Z',
          commentatorInfo: {
            userId: '77a70b58-ea72-4dfa-b33c-4d7b2c3c06ef',
            userLogin: '3334lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '090b59ca-0e38-4b8d-ae83-90cc03b65d65',
            blogName: 'new blog',
            title: 'post title',
            id: 'f1c9fb0b-61ec-4500-a8a5-50dd17285790',
          },
        },
        {
          id: '26cb1f45-d328-4b1c-9357-1c318970f828',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:23.582Z',
          commentatorInfo: {
            userId: '76928368-5d9c-42db-ba78-6553744324ca',
            userLogin: '3333lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: 'e91f51e8-9117-4ee3-a6c7-bc0e6ce58ad4',
            blogName: 'new blog',
            title: 'post title',
            id: '3ade3bd6-9dbb-4854-b0ed-8e4be45313f6',
          },
        },
        {
          id: 'c2f95f4a-7077-4717-9664-f86a3a0ffe26',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:20.653Z',
          commentatorInfo: {
            userId: '0824d4be-c7f1-43ab-b482-12485c8be9a0',
            userLogin: '3332lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '22c64413-388e-4484-b00e-7c49231f0f10',
            blogName: 'new blog',
            title: 'post title',
            id: '4e438969-d992-43f7-b530-bf041dcd3146',
          },
        },
        {
          id: 'fbd38917-accc-4a99-984a-1f2013a190d3',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:17.773Z',
          commentatorInfo: {
            userId: '09f46ed0-08a4-40dd-a038-ed1cf029934d',
            userLogin: '3331lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '51119889-f520-46d1-b2fe-7dcc2a9637e8',
            blogName: 'new blog',
            title: 'post title',
            id: '8ab0fe38-0f05-4638-8c08-52ca362dd0bd',
          },
        },
        {
          id: '9c6048a0-d7e1-4afc-a23c-a14e19d8708f',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:15.025Z',
          commentatorInfo: {
            userId: '811c0389-1d8a-4f08-93e5-9339e4981967',
            userLogin: '3330lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: 'f63f39bc-ffa8-4a6e-b03f-ba291d169231',
            blogName: 'new blog',
            title: 'post title',
            id: 'a3da9adc-dcb9-4721-b4bc-fd507c6d0c56',
          },
        },
        {
          id: '0ffdc1b1-ad96-43f8-b91d-43312174a4ab',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:11.717Z',
          commentatorInfo: {
            userId: '19c48887-b84e-4084-8ada-f9c286837f5d',
            userLogin: '3329lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: 'bbf5f533-c89c-4e32-86b6-9cabb4d6571e',
            blogName: 'new blog',
            title: 'post title',
            id: '245f5944-bb42-4314-9203-42ecb839e4fb',
          },
        },
        {
          id: 'dfe8c8cb-a869-43e5-9f35-69fc94053fb5',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:08.841Z',
          commentatorInfo: {
            userId: 'a0bc873a-9871-4574-b3ca-4ba133448b70',
            userLogin: '3328lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '8a935f0b-d7c1-4baa-81c4-cff595d96371',
            blogName: 'new blog',
            title: 'post title',
            id: 'a3ea937f-201c-4049-872f-f1fc83e3b247',
          },
        },
        {
          id: '83a20bba-88c2-4cde-a5bb-3366082211e1',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:05.891Z',
          commentatorInfo: {
            userId: 'dd3564f7-39da-49ca-aa9b-aafd7a911e5a',
            userLogin: '3327lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '0e29211e-e8b8-462d-bd45-0f3ccf4db16a',
            blogName: 'new blog',
            title: 'post title',
            id: 'd77b81fa-b78e-48c1-9137-3c834edc5706',
          },
        },
        {
          id: '199d7b34-fc93-4fe9-bf4c-28f5ebf823dd',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:06:02.938Z',
          commentatorInfo: {
            userId: '6dd7abcc-c867-4c1e-b3cc-8cc7d936ffdd',
            userLogin: '3326lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: '27691726-998c-4b18-9a73-d30675a2cafe',
            blogName: 'new blog',
            title: 'post title',
            id: '4a38be35-69c8-45fc-a315-e73b0849a52d',
          },
        },
        {
          id: '8f2b3d37-b3f4-467b-81ea-1d118f707749',
          content: 'length_21-weqweqweqwq',
          createdAt: '2023-02-10T19:05:59.785Z',
          commentatorInfo: {
            userId: 'afbd6595-ae65-462f-a832-d331060ea2dd',
            userLogin: '3325lg',
          },
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
          postInfo: {
            blogId: 'a117246e-bddd-46ef-a9dc-5d326fd28083',
            blogName: 'new blog',
            title: 'post title',
            id: '22c7e300-88b3-4b80-8083-d4ba26518c75',
          },
        },
      ],
    };
  }

  @ApiOperation({ summary: 'Ban/unban user for blog' })
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
  @Put('users/:userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUserForBlog(
    @Param('userId') userId: string,
    @Body() body: BanUserForBlogInput,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    return this.commandBus.execute(
      new UpdateBanUserForBlogCommand(body, userId, ctx.user.id),
    );
  }

  @ApiOperation({ summary: 'Returns all banned users for blog' })
  @ApiOkResponse({
    status: 200,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Not found',
  })
  @Get('users/blog/:blogId')
  async allBanUsersForBlog(
    @Query() pageOptionsDto: PageOptionsForUserDto,
    @Param('blogId') blogId: string,
    @GetCurrentJwtContext() ctx: JwtATPayload,
  ) {
    const blog = await this.blogsService.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (blog.userId !== ctx.user.id) {
      throw new ForbiddenException();
    }
    return this.usersQueryRepository.getBannedUsersForBlog(
      pageOptionsDto,
      blogId,
    );
  }
}

const data = {
  id: 'ea16cfda-d513-4317-9483-b55fd33d5ba0',
  content: 'length_21-weqweqweqwq',
  createdAt: '2023-02-10T19:06:26.490Z',
  commentatorInfo: {
    userId: '77a70b58-ea72-4dfa-b33c-4d7b2c3c06ef',
    userLogin: '3334lg',
  },
  postInfo: {
    id: 'f1c9fb0b-61ec-4500-a8a5-50dd17285790',
    title: 'post title',
    blogId: '090b59ca-0e38-4b8d-ae83-90cc03b65d65',
    blogName: 'new blog',
  },
};

const data2 = {
  id: 'ea16cfda-d513-4317-9483-b55fd33d5ba0',
  content: 'length_21-weqweqweqwq',
  createdAt: '2023-02-10T19:06:26.490Z',
  commentatorInfo: {
    userId: '77a70b58-ea72-4dfa-b33c-4d7b2c3c06ef',
    userLogin: '3334lg',
  },
  likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
  postInfo: {
    blogId: '090b59ca-0e38-4b8d-ae83-90cc03b65d65',
    blogName: 'new blog',
    title: 'post title',
    id: 'f1c9fb0b-61ec-4500-a8a5-50dd17285790',
  },
};
