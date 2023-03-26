import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { GetCurrentJwtContextWithoutAuth } from '../../../shared/decorators/get-current-user-without-auth.decorator';
import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { PostViewDto } from '../../posts/application/dto/post.view.dto';
import { IPostsQueryRepository } from '../../posts/infrastructure/posts.query.sql.repository';
import { BlogView } from '../application/dto/blog.dto';
import { IBlogsQueryRepository } from '../infrastructure/blogs.query.sql.repository';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: IBlogsQueryRepository,
    private readonly postsQueryRepository: IPostsQueryRepository,
  ) {}

  @ApiOkResponse({
    description: 'Success',
  })
  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.blogsQueryRepository.findAll(pageOptionsDto);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get(':blogId')
  async findOne(@Param('blogId') blogId: string): Promise<BlogView> {
    const blog = await this.blogsQueryRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    return this.blogsQueryRepository.findOne(blogId);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @ApiNotFoundResponse({
    description: 'If specificied blog is not exists',
  })
  @UseGuards(AuthGuard)
  @Get(':id/posts')
  async findBlogPosts(
    @GetCurrentJwtContextWithoutAuth() ctx: JwtATPayload | null,
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('id') id: string,
  ): Promise<PageDto<PostViewDto>> {
    return this.postsQueryRepository.findAll(
      {
        ...pageOptionsDto,
      },
      { blogId: id, userId: ctx?.user.id },
    );
  }
}
