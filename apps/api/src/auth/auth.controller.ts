import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses, AuthResponseDto, AuthUserDto } from '../common/swagger-models';
import { AuthService } from './auth.service';
import type { AuthResponse, AuthUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registro con contraseña hasheada' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiErrorResponses(400, 409)
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login y accessToken JWT' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiErrorResponses(400, 401)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usuario autenticado' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiErrorResponses(401)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
