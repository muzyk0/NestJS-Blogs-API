import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetCurrentJwtContextWithoutAuth } from '../../../common/decorators/get-current-user-without-auth.decorator';
import { PageOptionsDto } from '../../../common/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BindBlogOnUserCommand,
  BindBlogOnUserHandler,
} from '../../blogs/application/use-cases/bind-blog-on-user.handler';
import { GetBlogsCommand } from '../../blogs/application/use-cases/get-blogs.handler';
import { SuperAdminService } from '../application/super-admin.service';

@ApiTags('sa')
@ApiBasicAuth()
@UseGuards(BaseAuthGuard)
@Controller('sa')
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({ summary: 'Returns blogs with paging' })
  @ApiOkResponse({
    status: 200,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('blogs')
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.commandBus.execute(new GetBlogsCommand(pageOptionsDto));
  }

  @ApiOperation({
    summary: "Bind Blog with user (if blog doesn't have an owner yet)",
  })
  @ApiOkResponse({
    status: 200,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Put('blogs/:blogId/bind-with-user/:userId')
  bindBlogOnUser(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commandBus.execute(new BindBlogOnUserCommand(blogId, userId));
  }
}
