import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 } from 'uuid';

import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { GetCurrentJwtContext } from '../common/decorators/get-current-user.decorator';
import { LimitsControlWithIpAndLoginGuard } from '../limits/guards/limits-control-with-ip-and-login-guard.service';
import { LimitsControlGuard } from '../limits/guards/limits-control.guard';
import { SecurityService } from '../security/security.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailConfirmationCodeDto } from '../users/dto/email-confirmation-code.dto';
import { Email } from '../users/dto/email.dto';
import { RevokedTokenType } from '../users/schemas/revoked-tokens.schema';
import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtPayloadWithRt } from './types/jwt-payload-with-rt.type';
import { DecodedJwtRTPayload } from './types/jwtPayload.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private securityService: SecurityService,
  ) {}

  @UseGuards(LimitsControlWithIpAndLoginGuard, LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...tokens } = await this.authService.login(loginDto);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    const decodedAccessToken =
      await this.authService.decodeJwtToken<DecodedJwtRTPayload>(refreshToken);

    const userAgent = req.get('User-Agent');

    await this.securityService.create({
      userId: decodedAccessToken.user.id,
      ip: req.ip,
      deviceId: decodedAccessToken.deviceId,
      deviceName: userAgent,
      issuedAt: decodedAccessToken.iat,
      expireAt: decodedAccessToken.exp,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false,
      secure: false,
    });

    return tokens;
  }

  @UseGuards(LimitsControlGuard)
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
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException([
        { message: "Email isn't exist", field: 'email' },
      ]);
    }

    const isConfirmed = await this.authService.resendConfirmationCode(email);

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
    console.log(userId);
    const user = await this.usersService.findOneById(userId);

    return {
      email: user.accountData.email,
      login: user.accountData.login,
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

    const revokedToken: RevokedTokenType = {
      token: ctx.refreshToken,
      userAgent,
    };

    const isRevokedBefore = await this.usersService.checkRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (isRevokedBefore) {
      throw new UnauthorizedException();
    }

    const isRevoked = await this.usersService.revokeRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (!isRevoked) {
      throw new ForbiddenException({
        message: "User isn't existing",
        field: '',
      });
    }

    const tokens = await this.authService.createJwtTokens(
      {
        user: ctx.user,
      },
      {
        user: ctx.user,
        deviceId: v4(),
      },
    );

    const decodedAccessToken =
      await this.authService.decodeJwtToken<DecodedJwtRTPayload>(
        tokens.refreshToken,
      );

    await this.securityService.create({
      userId: decodedAccessToken.user.id,
      ip: req.ip,
      deviceId: decodedAccessToken.deviceId,
      deviceName: userAgent,
      issuedAt: decodedAccessToken.iat,
      expireAt: decodedAccessToken.exp,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
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

    const revokedToken: RevokedTokenType = {
      token: ctx.refreshToken,
      userAgent,
    };

    const isRevokedBefore = await this.usersService.checkRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (isRevokedBefore) {
      throw new UnauthorizedException();
    }

    const isRevoked = await this.usersService.revokeRefreshToken(
      ctx.user.id,
      revokedToken,
    );

    if (!isRevoked) {
      throw new ForbiddenException({
        message: "User isn't existing",
        field: '',
      });
    }

    res.clearCookie('refreshToken');
    return;
  }
}
