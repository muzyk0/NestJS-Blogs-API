import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailConfirmationCodeDto } from '../users/dto/email-confirmation-code.dto';
import { Email } from '../users/dto/email.dto';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);

    if (!token) {
      throw new UnauthorizedException();
    }

    return token;
  }

  @Post('/registration')
  async registerUser(@Body() { login, email, password }: CreateUserDto) {
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

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmAccount(@Body() { code }: EmailConfirmationCodeDto) {
    const isConfirmed = await this.authService.confirmAccount(code);

    if (!isConfirmed) {
      throw new BadRequestException();
    }

    return;
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(@Body() { email }: Email) {
    const isConfirmed = await this.authService.resendConfirmationCode(email);

    if (!isConfirmed) {
      throw new BadRequestException();
    }

    return;
  }
}
