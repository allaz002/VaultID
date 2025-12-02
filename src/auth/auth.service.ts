import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {} 
    
    private async generateTokensForUser(user: { id: number; email: string }) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);

        const refreshToken = randomUUID();
        const expiresAt = add(new Date(), { days: 7 });

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                expiresAt,
                user: { connect: { id: user.id } },
            },
        });

        return { accessToken, refreshToken };
    }

    async register(createUserDto: CreateUserDto) {
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Email is already registered.');
        }

        const passwordHash = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.usersService.createUser(
            createUserDto.email,
            passwordHash,
            createUserDto.name,
        );

        const tokens = await this.generateTokensForUser({
            id: user.id,
            email: user.email,
        });

        return{
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            ...tokens,
        }
    }

    private async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if(!user) {
            return null;
        }
        
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return null;
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }
    
        const tokens = await this.generateTokensForUser({
            id: user.id,
            email: user.email,
        });

        return tokens;
    }

    async refresh(refreshToken: string) {
        const existing = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if(!existing || existing.revoked) {
            throw new UnauthorizedException('Invalid refresh token.');
        }
        if(existing.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token has expired.');
        }
        
        /*
        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: { revoked: true },
        })
        */

        const tokens = await this.generateTokensForUser({
            id: existing.user.id,
            email: existing.user.email,
        });

        return tokens;
    }

    async logout(refreshToken: string) {
        const existing = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if(!existing) {
            return { success: true };
        }

        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: { revoked: true },
        });

        return { success: true };
    }
    
}
