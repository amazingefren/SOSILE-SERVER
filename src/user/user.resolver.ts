import 'reflect-metadata';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, UserCreateInput } from './user.model';
import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  constructor(
    private userService: UserService
  ){}

  @Query(()=>User)
  async debugUser(){
    return this.userService.user({id: 1})
  }

  @Mutation(()=>User)
  async register(@Args('data') data: UserCreateInput) {
    await this.userService.create(data)
  }
}
