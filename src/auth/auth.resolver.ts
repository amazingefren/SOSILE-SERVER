import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  AuthLoginUserInput,
  AuthRegisterUserInput,
  AuthUser,
} from './auth.model';
import { AuthService } from './auth.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthUser)
  async AuthRegisterUser(
    @Args('data') data: AuthRegisterUserInput,
    @Context() { res }: { res: FastifyReply },
  ) {
    try {
      if (await this.authService.RegisterUser(data)) {
        return await this.authService.LoginUser(
          { username: data.username, password: data.password },
          res,
        );
      }
    } catch (e) {
      return e;
    }
  }

  @Mutation(() => AuthUser)
  async AuthLoginUser(
    @Args('data') data: AuthLoginUserInput,
    @Context() { res }: { res: FastifyReply },
  ) {
    try {
      return await this.authService.LoginUser(data, res);
    } catch (e) {
      return e;
    }
  }

  @Mutation(() => Boolean)
  async AuthRefresh(
    @Context() { req, res }: { req: FastifyRequest; res: FastifyReply },
  ) {
    if (req.headers.authorization) {
      const user = await this.authService.ValidateRefreshToken(
        req.headers.authorization,
        {
          getUser: true,
        },
      );
      if (user) {
        const token = this.authService.GenerateAccessToken(user as AuthUser);
        res.setCookie('access_token', token, {
          httpOnly: true,
          sameSite: 'lax',
          // secure: true,
        });
        return true;
      }
      return false;
    } else {
      res.clearCookie('access_token');
      // res.clearCookie('refresh_token');
      return false;
    }
  }

  @Mutation(() => Boolean)
  async AuthLogout(
    @Context() { req, res }: { req: FastifyRequest; res: FastifyReply },
  ) {
    const rToken = req.headers.authorization;
    res.clearCookie('access_token');
    const success = await this.authService.wipeToken(rToken);
    if (success) {
      return true;
    }
    return false;
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async AuthCheck() {
    return true;
    // return false;
  }
}
