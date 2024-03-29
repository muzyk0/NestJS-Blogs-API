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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  PageOptionsDto,
  PageOptionsForUserDto,
} from '../../../shared/paginator/page-options.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { BindBlogOnUserCommand } from '../../blogs/application/use-cases';
import { IBlogsQueryRepository } from '../../blogs/infrastructure';
import { BanUnbanUserInput } from '../../users/application/dto/ban-unban-user.input';
import { CreateUserDto } from '../../users/application/dto/create-user.dto';
import {
  BanUnbanUserCommand,
  CreateUserCommand,
  GetUsersCommand,
  RemoveUserCommand,
} from '../../users/application/use-cases';
import { BanBlogInput } from '../application/input-dto/ban-blog.input';
import { BanBlogCommand } from '../application/use-cases/ban-blog.handler';

@ApiTags('superAdmin')
@ApiBasicAuth()
@UseGuards(BaseAuthGuard)
@Controller('sa')
export class SuperAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: IBlogsQueryRepository,
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
    return this.blogsQueryRepository.findAllForAdmin(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Bind Blog with user (if blog doesn't have an owner yet)",
  })
  @ApiNoContentResponse({
    status: 204,
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
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commandBus.execute(new BindBlogOnUserCommand(blogId, userId));
  }

  @ApiOperation({
    summary: 'Bun/unban blog',
  })
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
  @Put('blogs/:blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  banBlog(@Param('blogId') blogId: string, @Body() body: BanBlogInput) {
    return this.commandBus.execute(new BanBlogCommand(blogId, body.isBanned));
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
