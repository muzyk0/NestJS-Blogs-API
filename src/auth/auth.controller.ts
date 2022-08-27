import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { LimitsControlWithIpAndLoginGuard } from '../limits/guards/limits-control-with-ip-and-login-guard.service';
import { LimitsControlGuard } from '../limits/guards/limits-control.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailConfirmationCodeDto } from '../users/dto/email-confirmation-code.dto';
import { Email } from '../users/dto/email.dto';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LimitsControlGuard, LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    return tokens;
  }

  @UseGuards(LimitsControlWithIpAndLoginGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() { login, email, password }: CreateUserDto) {
    const userAlreadyExistByLogin = await this.usersService.findOneByLogin(
      login,
    );

    if (userAlreadyExistByLogin) {
      throw new BadRequestException([
        { message: 'Login already exist', field: 'login' },
      ]);
    }

    const userAlreadyExistByEmail = await this.usersService.findOneByEmail(
      email,
    );

    if (userAlreadyExistByEmail) {
      throw new BadRequestException([
        { message: 'Email already exist', field: 'email' },
      ]);
    }

    return this.usersService.create({ login, email, password });
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmAccount(@Body() { code }: EmailConfirmationCodeDto) {
    const isConfirmed = await this.authService.confirmAccount(code);

    if (!isConfirmed) {
      throw new BadRequestException([
        { message: 'Code isn"t correct', field: 'code' },
      ]);
    }

    return;
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(@Body() { email }: Email) {
    const isConfirmed = await this.authService.resendConfirmationCode(email);

    if (!isConfirmed) {
      throw new BadRequestException([
        { message: 'Email already confirm', field: 'email' },
      ]);
    }

    return;
  }
}
