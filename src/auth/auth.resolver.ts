import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthLoginUserInput, AuthRegisterUserInput } from './auth.model';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import { BadRequestException } from '@nestjs/common'

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
  async AuthLoginUser(@Args('data') data: AuthLoginUserInput) {
    try {
      return this.authService.LoginUser(data)
    } catch(e) {
      return e
    }
  }
}
