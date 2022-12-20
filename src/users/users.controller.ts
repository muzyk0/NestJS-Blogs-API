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

import { BaseAuthGuard } from '../auth/guards/base-auth-guard';
import { PageOptionsDto } from '../common/paginator/page-options.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersQueryRepository } from './users.query.repository';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  // @UseGuards(BaseAuthGuard)
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

    // return this.usersQueryRepository.findOne(user.id);
  }

  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.usersQueryRepository.findAll(pageOptionsDto);
  }

  // @UseGuards(BaseAuthGuard)
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
