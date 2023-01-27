import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
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
import {
  PageOptionsDto,
  PageOptionsForUserDto,
} from '../../../common/paginator/page-options.dto';
import { JwtATPayload } from '../../auth/application/interfaces/jwtPayload.type';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BindBlogOnUserCommand,
  BindBlogOnUserHandler,
} from '../../blogs/application/use-cases/bind-blog-on-user.handler';
import { GetBlogsCommand } from '../../blogs/application/use-cases/get-blogs.handler';
import { BanUnbanUserInput } from '../../users/application/dto/ban-unban-user.input';
import { CreateUserDto } from '../../users/application/dto/create-user.dto';
import { BanUnbanUserCommand } from '../../users/application/use-cases/ban-unban-user.handler';
import { CreateUserCommand } from '../../users/application/use-cases/create-user.handler';
import { GetUsersCommand } from '../../users/application/use-cases/get-users.handler';
import { RemoveUserCommand } from '../../users/application/use-cases/remove-user.handler';
import { SuperAdminService } from '../application/super-admin.service';

@ApiTags('superAdmin')
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
  findBlogs(@Query() pageOptionsDto: PageOptionsDto) {
    return this.commandBus.execute(
      new GetBlogsCommand(pageOptionsDto, null, true),
    );
  }

  @ApiOperation({
    summary: "Bind Blog with user (if blog doesn't have an owner yet)",
  })
  @ApiNoContentResponse({
    status: 200,
    description: 'No Content',
  })
  @ApiBadRequestResponse({
    status: 400,
    description:
      'If the inputModel has incorrect values or blog already bound to any user',
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

  @ApiOperation({ summary: 'Ban/unban user' })
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
  banUser(@Param('userId') userId: string, @Body() data: BanUnbanUserInput) {
    return this.commandBus.execute(new BanUnbanUserCommand(userId, data));
  }

  @ApiOperation({ summary: 'Add new user to the system' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Returns the newly created user',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() { login, email, password }: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand(login, email, password),
    );
  }

  @ApiOperation({ summary: 'Returns blogs users' })
  @ApiOkResponse({
    status: 200,
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('users')
  async findUsers(@Query() pageOptionsDto: PageOptionsForUserDto) {
    return this.commandBus.execute(new GetUsersCommand(pageOptionsDto));
  }

  @ApiOperation({ summary: 'Delete user specified by id' })
  @ApiNoContentResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'If specified user is not exists',
  })
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new RemoveUserCommand(id));
  }
}
