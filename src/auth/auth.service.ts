import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthLoginUserInput,
  AuthRegisterUserInput,
  AuthUser,
} from './auth.model';
import { User } from '../user/user.model';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/configuration';
import { FastifyReply } from 'fastify';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.CONFIG = this.configService.get<AuthConfig>('auth');
  }

  private readonly logger = new Logger('AuthService');
  private CONFIG: AuthConfig;

  // Hash Password
  private async HashPassword(password: string) {
    const hash = await bcrypt.hash(password, this.CONFIG.saltRounds);
    return hash;
  }

  // Generate Access JWT Token For Cookie
  private async GenerateAccessToken(payload: AuthUser) {
    const token = jwt.sign(
      {
        sub: payload.id,
        role: payload.role,
      },
      this.CONFIG.atSecret,
      { expiresIn: '20s' },
    );
    return token;
  }

  // Generate Refresh JWT Token For Cookie
  private async GenerateRefreshToken(payload: AuthUser) {
    // Create empty entity relation to payload
    const tokenTable = await this.prisma.rToken.create({
      data: {
        user: {
          connect: {
            username: payload.username,
          },
        },
      },
    });

    // Create JWT Token with previous table identifiers
    const token = jwt.sign(
      {
        sub: tokenTable.id,
        userid: payload.id,
        name: payload.username,
        date: tokenTable.timestamp,
      },
      this.CONFIG.rtSecret,
      { expiresIn: '2m' },
    );

    // Assign JWT Token to empty entity
    const final = await this.prisma.rToken.update({
      where: { id: tokenTable.id },
      data: {
        token,
      },
      select: { token: true },
    });
    console.log(final.token);

    // Start Development
    const check = await this.prisma.user.findUnique({
      where: { username: payload.username },
      include: { sessions: true },
    });
    console.log(check);
    await this.prisma.rToken.deleteMany({ where: { userId: payload.id } });
    // End Development

    return final.token;
  }

  /* User */
  async RegisterUser(data: AuthRegisterUserInput): Promise<Boolean | Error> {
    const hashedPassword = await this.HashPassword(data.password);
    await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    return true;
  }

  async LoginUser(
    data: AuthLoginUserInput,
    contextRes?: FastifyReply,
  ): Promise<User | Error> {
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    // +alot of execution time
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (user && isMatch) {
      if (contextRes) {
        const atoken = await this.GenerateAccessToken(user);
        const rtoken = await this.GenerateRefreshToken(user);
        contextRes.setCookie('access_token', atoken);
        contextRes.setCookie('refresh_token', rtoken);
      }
      return user as User;
    } else {
      throw new UnauthorizedException();
    }
  }

  /* Session */
  async ValidateSession(rtoken: any) {
    // temp
    const username = rtoken.username;

    await this.prisma.user.findUnique({ where: { username } });
  }

  async ValidateAccess(atoken: any): Promise<Boolean> {
    // jwt verify
    console.log(atoken);
    return true;
  }
}
