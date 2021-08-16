import {
  Args,
  Context,
  GqlContextType,
  GqlExecutionContext,
  GraphQLExecutionContext,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { AuthLoginUserInput, AuthRegisterUserInput } from './auth.model';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import {
  BadRequestException,
  // UseGuards,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
// import { RoleGuard } from './guards/role.guard';

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
      return new BadRequestException(e);
    }
  }

  @Query(() => User)
  // @UseGuards(RoleGuard)
  async AuthLoginUser(
    @Args('data') data: AuthLoginUserInput,
    @Context() { res }: { res: FastifyReply },
  ) {
    try {
      return this.authService.LoginUser(data, res);
    } catch (e) {
      return new BadRequestException(e);
    }
  }

  // When a users access token is no longer valid
  // sosile-client will then refresh that token here
  // so that continuous operation resumes
  //
  // I can then use this to
  //  1. Resign access token
  //  2. Verify refresh_token with users real sessions
  @Mutation(() => Boolean)
  async AuthRefresh(
    @Context() { req, res }: { req: FastifyRequest; res: FastifyReply },
  ) {
    console.log(req.cookies.hi);
    if (req.cookies.refresh_token) {
      // verify refresh_token from db.user.sessions
      // if false, clear refresh_token and return false
      // if true gen new access token
      await this.authService.ValidateSession(req.cookies.refresh_token);
      res.cookie('access_token', 'new_access_token');
      return true;
    } else {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return false;
    }
  }
}
