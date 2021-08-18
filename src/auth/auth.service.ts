import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthLoginUserInput,
  AuthRegisterUserInput,
  AuthUser,
} from './auth.model';
import { User } from '../user/user.model';
import { ConfigService } from '@nestjs/config';
import { AuthConfig, DevelopmentConfig } from '../config/configuration';
import { FastifyReply } from 'fastify';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    if (
      configService.get<DevelopmentConfig>('development').logLevel != 'debug'
    ) {
      // Emit Verbose Logs unless 'verbose' is specified
      this.logger.debug = () => {};
    }
    this.CONFIG = this.configService.get<AuthConfig>('auth');
  }

  private logger = new Logger('AuthService');
  private CONFIG: AuthConfig;

  /**
   * Handle User Registration and returns User
   * @param data AuthRegisterUserInput
   * @returns Boolean or Error
   */
  async RegisterUser(data: AuthRegisterUserInput): Promise<Boolean | Error> {
    const hashedPassword = await this.HashPassword(data.password);
    await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    return true;
  }

  /**
   * Handle User Login and Sets Cookies if contextRes is provided
   * @param data AuthLoginUserInput
   * @param contextRes? FastifyReply
   * @returns Promise | User |Error
   */
  async LoginUser(
    data: AuthLoginUserInput,
    contextRes?: FastifyReply,
  ): Promise<User | Error> {
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (user && isMatch) {
      this.logger.verbose('LoginUser matched');
      if (contextRes) {
        this.logger.verbose('Generating Access Tokens');
        const atoken = this.GenerateAccessToken(user);
        const rtoken = await this.GenerateRefreshToken(user);
        this.logger.verbose('Assigning Cookies to Response Context');
        contextRes.setCookie('access_token', atoken);
        contextRes.setCookie('refresh_token', rtoken);
      }
      return user as User;
    } else {
      throw new UnauthorizedException();
    }
  }

  /* SECTION: Sessions */
  /** @todo */
  /* async ValidateSession(rtoken: any) {
    const username = rtoken.username;
    await this.prisma.user.findUnique({ where: { username } });
  } */

  /** @todo */
  /* async ValidateAccess(atoken: any): Promise<Boolean> {
    // jwt verify
    console.log(atoken);
    return true;
  } */

  /* SECTION: Encryption */
  /**
   * Hash plain password using bcrypt
   * @param password string
   * @returns hashedPassword as string
   */
  private async HashPassword(password: string) {
    const hash = await bcrypt.hash(password, this.CONFIG.saltRounds);
    return hash;
  }

  /* SECTION: JWT */
  /**
   * Generate and Set Refresh Token in Database
   * @param payload AuthUser
   * @returns jwtRefreshToken as Promise<string>
   * @private
   */
  private async GenerateRefreshToken(payload: AuthUser): Promise<string> {
    // Create empty entity relation to payload
    this.logger.verbose('Assigning JWT refresh_token to database');
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

    // Start Development
    /* const check = await this.prisma.user.findUnique({
      where: { username: payload.username },
      include: { sessions: true },
    });
    await this.prisma.rToken.deleteMany({ where: { userId: payload.id } });
    this.logger.debug(check); */
    // End Development

    return final.token;
  }

  /**
   * Generate Access Token
   * @param payload AuthUser
   * @returns jwtAccesToken as string
   */
  GenerateAccessToken(payload: AuthUser): string {
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

  /**
   * Verify Access_Token
   * @param token string
   * @returns boolean
   */
  ValidateAccessToken(
    token: string,
    opts?: { getPayload: boolean },
  ): boolean | any {
    const jwtPayload: any = jwt.verify(token, this.CONFIG.atSecret);
    if (opts.getPayload) {
      return jwtPayload;
    }
    return token ? true : false;
  }
  /**
   * Verify Refresh_Token
   * @param token string
   * @returns boolean
   */
  async ValidateRefreshToken(
    token: string,
    opts?: {
      getUser: boolean;
    },
  ): Promise<boolean | AuthUser> {
    const jwtPayload: any = jwt.verify(token, this.CONFIG.rtSecret);
    try {
      const data = await this.prisma.rToken.findUnique({
        where: {
          id: Number(jwtPayload.sub),
        },
        include: { user: opts.getUser },
      });
      if (opts.getUser && data.token == token) {
        return data.user;
      }
      return data.token == token ? true : false;
    } catch (e) {
      return false;
    }
  }
}
