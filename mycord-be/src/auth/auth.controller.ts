import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.dto';
import { Response } from 'express';
import { RequestObject } from 'req.type';
import { AuthGuard } from 'guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get()
  getCurrentUser(@Req() request: RequestObject): Promise<User> {
    return this.authService.getUserById(request.token.id);
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() user: LoginDto,
  ): Promise<any> {
    const token = await this.authService.login(user);
    response.cookie('token', token, { maxAge: 3600000, httpOnly: true });

    return { token };
  }

  @Post('register')
  register(@Body() user: RegisterDto): Promise<User> {
    return this.authService.register(user);
  }

  @UseGuards(AuthGuard)
  @Delete('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    response.clearCookie('token');
    return true;
  }
}
