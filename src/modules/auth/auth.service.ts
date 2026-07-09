import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto, RegisterDto, JwtPayload } from './dto/auth.dto.js';
import { createSuccessResponse } from '../../common/utils/response.util.js';
import type { ApiResponse } from '../../common/interfaces/response.interface.js';

export interface AuthTokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<ApiResponse<AuthTokenResponse>> {
    this.logger.log(`Registering user: ${dto.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: { id: true, email: true, name: true },
    });

    const token = this.generateToken(user);

    return createSuccessResponse('User registered successfully', {
      accessToken: token,
      user,
    });
  }

  async login(dto: LoginDto): Promise<ApiResponse<AuthTokenResponse>> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = this.generateToken(userResponse);

    return createSuccessResponse('Login successful', {
      accessToken: token,
      user: userResponse,
    });
  }

  async getProfile(userId: string): Promise<ApiResponse<object>> {
    this.logger.log(`Fetching profile for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return createSuccessResponse('Profile retrieved successfully', user);
  }

  private generateToken(user: { id: string; email: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
}
