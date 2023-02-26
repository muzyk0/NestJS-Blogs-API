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
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { AuthGuard } from '../../auth/guards/auth-guard';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { BlogsService } from '../application/blogs.service';
import { IBlogsQueryRepository } from '../infrastructure/blogs.query.sql.repository';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: IBlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
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
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findOne(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
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
  ) {
    const blog = await this.blogsService.findOne(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return this.postsQueryRepository.findAll({
      ...pageOptionsDto,
      blogId: id,
      userId: ctx?.user.id,
    });
  }
}
