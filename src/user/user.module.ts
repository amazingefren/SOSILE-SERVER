import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserResolver } from './user.resolver';
import { AuthService } from 'auth/auth.service';

@Module({
  providers: [PrismaService, UserResolver, UserService, AuthService],
})
export class UserModule {}
