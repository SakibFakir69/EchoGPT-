import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '../utils/auth/utils.auth.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    response.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
  }

  @Post('login')
  @ResponseMessage('Logged in successfully')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setAuthCookies(response, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('refresh')
  @ResponseMessage('Token refreshed')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken } = await this.authService.refresh(token);
    this.setAuthCookies(response, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('logout')
  @HttpCode(200)
  @ResponseMessage('Logged out successfully')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return null;
  }

  @Post('forgot-password')
  @ResponseMessage('If that email exists, a reset link has been sent')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ResponseMessage('Password reset successful')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}