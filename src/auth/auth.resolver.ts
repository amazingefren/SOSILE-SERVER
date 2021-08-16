import { Args, Context, GqlContextType, GqlExecutionContext, GraphQLExecutionContext, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthLoginUserInput, AuthRegisterUserInput } from './auth.model';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import { BadRequestException, ExecutionContext, UseInterceptors } from '@nestjs/common'
import { LoggingInterceptor } from './interceptors/cookie.interceptor';
import { FastifyRequest, FastifyReply } from 'fastify';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async AuthRegisterUser(@Args('data') data: AuthRegisterUserInput) {
    try{
      if (await this.authService.RegisterUser(data)){
        return await this.AuthLoginUser({username: data.username, password: data.password})
      }
    } catch (e) {
      return new BadRequestException(e)
    }
  }

  @Query(() => User)
  // @UseGuards(RoleGuard)
  async AuthLoginUser(@Args('data') data: AuthLoginUserInput) {
    try {
      return this.authService.LoginUser(data)
    } catch(e) {
      return e
    }
  }

  // When a users access token is no longer valid
  // sosile-client will then refresh that token here
  // so that continuous operation resumes
  //
  // I can then use this to 
  //  1. Resign access token
  //  2. Verify refresh_token with users real sessions
  @Mutation(()=>Boolean)
  async AuthRefresh(
    @Context() {req, res}: {req: FastifyRequest, res: FastifyReply}
  ){
    console.log(req.cookies.hi)
    if (req.cookies.refresh_token){
      // verify refresh_token from db.user.sessions
        // if false, clear refresh_token and return false
        // if true gen new access token
      res.cookie('access_token','new_access_token')
      return true
    } else {
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')
      return false
    }
  }
}
