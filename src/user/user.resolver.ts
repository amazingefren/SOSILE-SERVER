import 'reflect-metadata';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, UserAuthIncludeOpts, UserUniqueInput } from './user.model';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { CurrentUser } from './decorators/user.decorator';

@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async debugUsers() {
    return this.userService.allUsers();
  }

  @Query(() => User, { nullable: true })
  async user(
    @Args('where', { nullable: false }) where: UserUniqueInput,
    @Args('include', { nullable: true }) include: UserAuthIncludeOpts,
  ) {
    const { id, username, email } = where;
    if (id) {
      return this.userService.user({ id }, include);
    } else if (username) {
      return this.userService.user({ username }, include);
    } else if (email) {
      return this.userService.user({ email }, include);
    } else {
      throw new ForbiddenException('Invalid Inputs');
    }
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async whoAmI(
    @CurrentUser() user: number,
    @Args('include', { nullable: true }) include: UserAuthIncludeOpts,
  ) {
    return this.userService.user({ id: user }, include);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async userFollow(
    @CurrentUser() follower: number,
    @Args('user', { nullable: false }) following: number,
  ): Promise<User | null> {
    return this.userService.userFollow(follower, following);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async userUnfollow(
    @CurrentUser() user: number,
    @Args('user', { nullable: false }) following: number,
  ) {
    return this.userService.userUnfollow(user, following);
  }
}
