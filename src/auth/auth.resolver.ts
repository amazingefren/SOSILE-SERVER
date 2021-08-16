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

  @Mutation(()=>Boolean)
  async AuthRefresh(
    @Context() {req, res}: {req: FastifyRequest, res: FastifyReply}
  ){
    console.log(req.cookies)
    res.header('hi','hi')
    res.cookie('hi','hi')
    res.clearCookie('hi')
    return true 
  }
}
