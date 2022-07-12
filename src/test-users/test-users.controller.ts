import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TestUsersService } from './test-users.service';

@Controller('users')
export class TestUsersController {
  constructor(protected usersService: TestUsersService) {}

  @Get()
  getUsers(@Query('term') term: string) {
    return this.usersService.findUsers(term);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return [{ id: 1 }, { id: 2 }].find((u) => u.id === +id);
  }

  @Post()
  createUser(@Body() inputModel: CreateInputModel) {
    return { id: 1, name: inputModel.name, children: inputModel.children };
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return 'OK';
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() model: CreateInputModel) {
    return {
      id,
      model,
    };
  }
}

interface CreateInputModel {
  name: string;
  children: number;
}
