import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserResolver } from './user.resolver';

@Module({
  providers: [PrismaService, UserResolver, UserService],
})
export class UserModule {}
