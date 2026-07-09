import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { loginDtoSchema, registerDtoSchema } from './dto/auth.dto.js';
import type { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import type { ApiResponse } from '../../common/interfaces/response.interface.js';
import type { AuthTokenResponse } from './auth.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'User registration data',
    schema: {
      type: 'object',
      required: ['nis', 'name', 'username', 'email', 'password'],
      properties: {
        nis: { type: 'string', example: '31312313123' },
        name: { type: 'string', example: 'Romeo Aditya Pratama' },
        username: { type: 'string', example: 'romeoadity_' },
        email: {
          type: 'string',
          format: 'email',
          example: 'romeo@example.com',
        },
        password: { type: 'string', minLength: 8, example: 'SecurePass123' },
      },
    },
  })
  async register(
    @Body(new ZodValidationPipe(registerDtoSchema)) dto: RegisterDto,
  ): Promise<ApiResponse<AuthTokenResponse>> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({
    description: 'User login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePass123' },
      },
    },
  })
  async login(
    @Body(new ZodValidationPipe(loginDtoSchema)) dto: LoginDto,
  ): Promise<ApiResponse<AuthTokenResponse>> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(
    @GetUser('id') userId: string,
  ): Promise<ApiResponse<object>> {
    return this.authService.getProfile(userId);
  }
}
