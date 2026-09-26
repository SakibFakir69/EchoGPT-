
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    private async issueTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: { ...dto, password: hashedPassword },
        });

        return this.issueTokens(user.id, user.email, user.role);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

        if (!user || user.isDeleted) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueTokens(user.id, user.email, user.role);
    }

    async refresh(refreshToken: string) {
        let payload: { sub: string; email: string; role: string };

        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || user.isDeleted) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        return this.issueTokens(user.id, user.email, user.role);
    }
    async forgotPassword(dto: ForgotPasswordDto) {
        
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

        // Always return the same response whether or not the email exists —
        // otherwise you leak which emails are registered.
        if (!user || user.isDeleted) {
            return { success: true, message: 'If that email exists, a reset link has been sent' };
        }

        return true;
    }


    async resetPassword(dto: ResetPasswordDto) {
        
        return true;
    }
}