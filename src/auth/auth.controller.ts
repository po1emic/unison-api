import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

interface AuthenticatedUser {
  sub: string;
  refreshToken: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Request() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const data = await this.authService.signIn(req.user);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken: data.accessToken };
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  signOut(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Request() req: AuthenticatedRequest,
  ) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    });

    return this.authService.logOut(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('token')
  async generateToken(@Body() data: { roomName: string; identity: string }) {
    const token = await this.authService.createToken(
      data.roomName,
      data.identity,
    );
    return { token };
  }
}
