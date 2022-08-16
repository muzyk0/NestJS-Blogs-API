import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BaseAuthGuard } from '../common/guards/base-auth-guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() { login, email, password }: CreateUserDto) {
    const userAlreadyExistByLogin = await this.usersService.findOneByLogin(
      login,
    );

    if (userAlreadyExistByLogin) {
      throw new BadRequestException();
    }

    const userAlreadyExistByEmail = await this.usersService.findOneByEmail(
      email,
    );

    if (userAlreadyExistByEmail) {
      throw new BadRequestException();
    }

    return this.usersService.create({ login, email, password });
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
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
