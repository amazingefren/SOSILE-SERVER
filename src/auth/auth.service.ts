import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthLoginUserInput, AuthRegisterUserInput } from './auth.model';
import { User } from '../user/user.model';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/configuration';
import { FastifyReply } from 'fastify';

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
  private async GenerateAccessToken(payload: any) {}

  // Generate Refresh JWT Token For Cookie
  private async GenerateRefreshToken(payload: any) {}

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
        this.logger.verbose('Generating Tokens');
        this.logger.verbose('Assigning Tokens');
        this.logger.verbose('Applying Cookies');
        contextRes.setCookie('test', 'test2');
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
