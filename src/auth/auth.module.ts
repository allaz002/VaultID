import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/user.entity';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
        UsersModule,
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'changeme',
        signOptions: { expiresIn: '15m' },
      }),
    })
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
