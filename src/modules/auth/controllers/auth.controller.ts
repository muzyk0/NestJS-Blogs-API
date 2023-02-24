import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { SecurityService } from '../../security/application/security.service';
import { CreateUserDto } from '../../users/application/dto/create-user.dto';
import { EmailConfirmationCodeDto } from '../../users/application/dto/email-confirmation-code.dto';
import { Email } from '../../users/application/dto/email.dto';
import { CreateUserCommand } from '../../users/application/use-cases/create-user.handler';
import { UsersRepository } from '../../users/infrastructure/users.repository.sql';
import { LoginDto } from '../application/dto/login.dto';
import { JwtPayloadWithRt } from '../application/interfaces/jwt-payload-with-rt.type';
import { DecodedJwtRTPayload } from '../application/interfaces/jwtPayload.type';
import { TokensType } from '../application/interfaces/tokens.type';
import { JwtService } from '../application/jwt.service';
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
    private readonly usersRepository: UsersRepository,
    private readonly securityService: SecurityService,
    private readonly jwtService: JwtService,
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
    const user = await this.commandBus.execute(
      new LoginCommand(loginDto.loginOrEmail, loginDto.password),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const { refreshToken, ...tokens } = user;

    const decodedAccessToken =
      await this.jwtService.decodeJwtToken<DecodedJwtRTPayload>(refreshToken);

    const userAgent = req.get('User-Agent');

    await this.securityService.createOrUpdate({
      userId: decodedAccessToken.user.id,
      ip: req.ip,
      deviceId: decodedAccessToken.deviceId,
      deviceName: userAgent,
      issuedAt: decodedAccessToken.iat,
      expireAt: decodedAccessToken.exp,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: !this.isDev,
      secure: !this.isDev,
    });

    return tokens;
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
    const isConfirmed = await this.commandBus.execute<
      ConfirmAccountCommand,
      boolean
    >(new ConfirmAccountCommand(code));

    if (!isConfirmed) {
      throw new BadRequestException([
        { message: "Code isn't correct", field: 'code' },
      ]);
    }

    return;
  }

  @UseGuards(LimitsControlGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(@Body() { email }: Email) {
    const user = await this.usersRepository.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException([
        { message: "Email isn't exist", field: 'email' },
      ]);
    }

    const isConfirmed = await this.commandBus.execute(
      new ResendConfirmationCodeCommand(email),
    );

    if (!isConfirmed) {
      throw new BadRequestException([
        { message: 'Email already confirm', field: 'email' },
      ]);
    }

    return;
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async me(@GetCurrentUserId() userId: string) {
    const user = await this.usersRepository.findOneById(userId);

    return {
      email: user.email,
      login: user.login,
      userId,
    };
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
