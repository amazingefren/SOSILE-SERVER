import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'auth/auth.service';

@Module({
  providers: [PrismaService, PostService, PostResolver, AuthService],
})
export class PostModule {}
