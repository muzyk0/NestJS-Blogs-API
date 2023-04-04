import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { GetCurrentUserId } from '../../../shared/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContext } from '../../../shared/decorators/get-current-user.decorator';
import { LimitsControlWithIpAndLoginGuard } from '../../limits/guards/limits-control-with-ip-and-login-guard.service';
import { LimitsControlGuard } from '../../limits/guards/limits-control.guard';
import { CreateRecoveryPasswordDto } from '../../password-recovery/application/dto/confirm-password-recovery.dto';
import { CreateUserDto } from '../../users/application/dto/create-user.dto';
import { EmailConfirmationCodeDto } from '../../users/application/dto/email-confirmation-code.dto';
import { Email } from '../../users/application/dto/email.dto';
import { CreateUserCommand } from '../../users/application/use-cases';
import { IUsersQueryRepository } from '../../users/controllers/interfaces/users-query-repository.abstract-class';
import { LoginDto } from '../application/dto/login.dto';
import { JwtPayloadWithRt } from '../application/interfaces/jwt-payload-with-rt.type';
import { TokensType } from '../application/interfaces/tokens.type';
import { ConfirmAccountCommand } from '../application/use-cases/confirm-account.handler';
import { ConfirmPasswordRecoveryCommand } from '../application/use-cases/confirm-password-recovery.handler';
import { LoginCommand } from '../application/use-cases/login.handler';
import { LogoutCommand } from '../application/use-cases/logout.handler';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.handler';
import { ResendConfirmationCodeCommand } from '../application/use-cases/resend-confirmation-code.handler';
import { SendRecoveryPasswordTempCodeCommand } from '../application/use-cases/send-recovery-password-temp-code.handler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  isDev: boolean;

  constructor(
    private readonly usersQueryRepository: IUsersQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {
    this.isDev = config.get<boolean>('IS_DEV');
  }

  @UseGuards(LimitsControlWithIpAndLoginGuard, LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('User-Agent');

    const tokens = await this.commandBus.execute<LoginCommand, TokensType>(
      new LoginCommand(
        loginDto.loginOrEmail,
        loginDto.password,
        userAgent,
        req.ip,
      ),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: !this.isDev,
      secure: !this.isDev,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() { login, email, password }: CreateUserDto) {
    await this.commandBus.execute(
      new CreateUserCommand(login, email, password),
    );
    return;
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmAccount(@Body() { code }: EmailConfirmationCodeDto) {
    return this.commandBus.execute<ConfirmAccountCommand, boolean>(
      new ConfirmAccountCommand(code),
    );
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(@Body() { email }: Email) {
    return this.commandBus.execute(new ResendConfirmationCodeCommand(email));
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async me(@GetCurrentUserId() userId: string) {
    return this.usersQueryRepository.findOneForMeQuery(userId);
  }

  @Post('/refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res,
    @GetCurrentJwtContext() ctx: JwtPayloadWithRt,
  ) {
    const userAgent = req.get('User-Agent');

    const tokens: TokensType = await this.commandBus.execute(
      new RefreshTokenCommand(ctx, userAgent, req.ip),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: !this.isDev,
      secure: !this.isDev,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('/logout')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res,
    @GetCurrentJwtContext() ctx: JwtPayloadWithRt,
  ) {
    const userAgent = req.get('User-Agent');

    await this.commandBus.execute(new LogoutCommand(ctx, userAgent));

    res.clearCookie('refreshToken');
    return;
  }

  @Post('/password-recovery')
  @UseGuards(LimitsControlWithIpAndLoginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(@Body() { email }: Email) {
    return this.commandBus.execute(
      new SendRecoveryPasswordTempCodeCommand(email),
    );
  }

  @Post('/new-password')
  @UseGuards(LimitsControlWithIpAndLoginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRecoveryPassword(
    @Body() { newPassword, recoveryCode }: CreateRecoveryPasswordDto,
  ) {
    return this.commandBus.execute(
      new ConfirmPasswordRecoveryCommand(recoveryCode, newPassword),
    );
  }
}
