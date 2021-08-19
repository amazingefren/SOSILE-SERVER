import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import {
  AuthLoginUserInput,
  AuthRegisterUserInput,
  AuthUser,
} from './auth.model';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ApolloError } from 'apollo-server-fastify';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
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

  @Mutation(() => User)
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
    if (req.cookies.refresh_token) {
      const user = await this.authService.ValidateRefreshToken(
        req.cookies.refresh_token,
        { getUser: true },
      );
      if (user) {
        const token = this.authService.GenerateAccessToken(user as AuthUser);
        res.setCookie('access_token', token);
        return true;
      }
      return false;
    } else {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return false;
    }
  }

  @Mutation(() => Boolean)
  async AuthLogout(
    @Context() { req, res }: { req: FastifyRequest; res: FastifyReply },
  ) {
    const success = await this.authService.wipeToken(req.cookies.refresh_token);
    if (success) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return true;
    }
    return false;
  }
}
