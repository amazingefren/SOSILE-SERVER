import 'reflect-metadata';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  async debugUser() {
    return this.userService.user({ id: 1 });
  }
}
