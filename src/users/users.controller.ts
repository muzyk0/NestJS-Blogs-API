import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
