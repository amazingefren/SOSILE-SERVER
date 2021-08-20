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
import { UserInputError } from 'apollo-server-fastify';
import { Prisma } from '@prisma/client';

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

  private async checkUnique(data: AuthRegisterUserInput): Promise<string[]> {
    let meta = [];
    (await this.prisma.user.findUnique({
      where: { username: data.username },
    })) && meta.push('username');
    (await this.prisma.user.findUnique({ where: { email: data.email } })) &&
      meta.push('email');
    return meta;
  }
  /**
   * Handle User Registration and returns User
   * @param data AuthRegisterUserInput
   * @returns Boolean or Error
   */
  async RegisterUser(data: AuthRegisterUserInput): Promise<Boolean | Error> {
    const hashedPassword = await this.HashPassword(data.password);
    await this.prisma.user
      .create({
        data: { ...data, password: hashedPassword },
      })
      .catch(async (e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          throw new UserInputError('User Already Exists', {
            meta: await this.checkUnique(data),
          });
        }
        this.logger.error(e);
        throw new Error('Something Went Wrong!');
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
  ): Promise<AuthUser | Error> {
    const user = await this.prisma.user
      .findUnique({
        where: { username: data.username },
      })
      .then((data) => {
        if (!data) throw new UserInputError('Invalid Credentials');
        return data;
      });

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (user && isMatch) {
      this.logger.verbose('LoginUser matched');
      this.logger.verbose('Generating Access Tokens');
      const atoken = this.GenerateAccessToken(user);
      const rtoken = await this.GenerateRefreshToken(user);
      this.logger.verbose('Assigning Cookies to Response Context');
      contextRes.setCookie('access_token', atoken, {
        httpOnly: true,
        sameSite: 'lax',
        // secure: true,
      });
      // contextRes.setCookie('refresh_token', rtoken);
      return { ...user, token: rtoken } as AuthUser;
    } else {
      throw new UserInputError('Invalid Credentials');
    }
  }

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

    /* if (
      this.configService.get<ServerConfig>('server').nodeEnv == 'development'
    ) {
      // this.logger.verbose(await this.prisma.user.findUnique({where: {id: payload.id}, include: {sessions: true}}))
      await this.prisma.rToken.deleteMany({ where: { userId: payload.id } });
    } */

    return 'Bearer ' + final.token;
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
    opts: { getPayload: boolean } = { getPayload: false },
  ): boolean | any {
    if (!token) {
      this.logger.debug('token not provided');
      throw new UnauthorizedException();
    }
    const jwtPayload: any = jwt.verify(token, this.CONFIG.atSecret, {
      ignoreExpiration: true,
    });
    if (opts.getPayload == true) {
      return jwtPayload;
    }
    return token ? true : false;
  }

  private adjustRefreshToken(token: string): string {
    const sections = token.split(' ');
    if (sections.length === 2) {
      const bearer = sections[0];
      const credentials = sections[1];
      if (bearer === 'Bearer' && /^Bearer$/i.test(bearer)) {
        return credentials;
      } else {
        throw new UnauthorizedException();
      }
    }
  }

  /**
   * Verify Refresh_Token
   * @param token string
   * @returns boolean
   */
  async ValidateRefreshToken(
    unformattedToken: string,
    opts?: {
      getUser: boolean;
    },
  ): Promise<boolean | AuthUser> {
    const token = this.adjustRefreshToken(unformattedToken);
    const jwtPayload: any = jwt.verify(token, this.CONFIG.rtSecret, {
      ignoreExpiration: true,
    });
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

  async wipeToken(token: string) {
    try {
      const jwtPayload: any = jwt.verify(
        this.adjustRefreshToken(token),
        this.CONFIG.rtSecret,
        {
          ignoreExpiration: true,
        },
      );
      await this.prisma.rToken.delete({
        where: {
          id: Number(jwtPayload.sub),
        },
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
