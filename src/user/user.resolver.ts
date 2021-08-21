import 'reflect-metadata';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, UserIncludeOpts } from './user.model';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/user.decorator';
import { Fields } from 'src/graphql/fields.decorator';

@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async debugUsers(@Fields(UserIncludeOpts) opts: UserIncludeOpts) {
    return this.userService.allUsers(opts);
  }

  @Query(() => User, { nullable: true })
  async findUserById(
    @Args('id') id: number,
    @Fields(UserIncludeOpts) opts: UserIncludeOpts,
  ) {
    return this.userService.findUser({ id }, opts);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async whoAmI(
    @CurrentUser() id: number,
    @Fields(UserIncludeOpts) opts: UserIncludeOpts,
  ) {
    return this.userService.findUser({ id }, opts);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async userFollow(
    @CurrentUser() follower: number,
    @Args('user', { nullable: false }) following: number,
  ): Promise<Boolean | null> {
    return this.userService.userFollow(follower, following).catch(() => {
      throw new Error('Not Following');
    });
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async userUnfollow(
    @CurrentUser() user: number,
    @Args('user', { nullable: false }) following: number,
  ) {
    return this.userService.userUnfollow(user, following).catch(() => {
      throw new Error('Not Following');
    });
  }
}
