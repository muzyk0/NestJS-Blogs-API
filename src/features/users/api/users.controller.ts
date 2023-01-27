import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { PageOptionsForUserDto } from '../../../common/paginator/page-options.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { CreateUserCommand } from '../application/use-cases/create-user.handler';
import { GetUsersCommand } from '../application/use-cases/get-users.handler';
import { RemoveUserCommand } from '../application/use-cases/remove-user.handler';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() { login, email, password }: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand(login, email, password),
    );
  }

  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsForUserDto) {
    return this.commandBus.execute(new GetUsersCommand(pageOptionsDto));
  }

  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new RemoveUserCommand(id));
  }
}
