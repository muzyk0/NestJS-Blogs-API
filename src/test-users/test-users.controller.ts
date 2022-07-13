import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateInputModel, TestUsersService } from './test-users.service';

@Controller('users')
export class TestUsersController {
  constructor(protected usersService: TestUsersService) {}

  @Get()
  getUsers(@Query('term') term: string) {
    return this.usersService.findUsers(term);
  }

  @Get(':id')
  getUser(@Param('id') id: number) {
    return [{ id: 1 }, { id: 2 }].find((u) => u.id === +id);
  }

  @Post()
  async createUser(@Body() inputModel: CreateInputModel) {
    inputModel.name = '';
    await this.usersService.createUser(inputModel);
    return inputModel;
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return 'OK';
  }

  @Put(':id')
  updateUser(@Param('id') id: number, @Body() model: CreateInputModel) {
    return {
      id,
      model,
    };
  }
}
