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
    ) {} 
    
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

        return { id: user.id, email: user.email, name: user.name };
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
    
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
    }

}
