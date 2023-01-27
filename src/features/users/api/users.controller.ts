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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { PageOptionsForUserDto } from '../../../common/paginator/page-options.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { GetUsersCommand } from '../application/use-cases/get-users.handler';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() { login, email, password }: CreateUserDto) {
    const userAlreadyExistByLogin =
      await this.usersService.findOneByLoginOrEmail(login);

    if (userAlreadyExistByLogin) {
      throw new BadRequestException({
        field: '',
        message: 'User already exist',
      });
    }

    const userAlreadyExistByEmail = await this.usersService.findOneByEmail(
      email,
    );

    if (userAlreadyExistByEmail) {
      throw new BadRequestException({
        field: '',
        message: 'User already exist',
      });
    }

    return this.usersService.create({ login, email, password });
  }

  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsForUserDto) {
    return this.commandBus.execute(new GetUsersCommand(pageOptionsDto));
  }

  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return this.usersService.remove(id);
  }
}
