import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { CreatePostInput, Post, PostIncludeOpts } from './post.model';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(() => [Post])
  async debugPosts() {
    return this.postService.allPosts();
  }

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async createPost(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
  ) {
    return this.postService.createPost(user, data);
  }

  @Query(() => [Post])
  @UseGuards(AuthGuard)
  async userPosts(
    @CurrentUser() currentUserId: number,
    @Args('user', { nullable: true }) requestUserId?: number,
    @Args('include', { nullable: true }) include?: PostIncludeOpts,
    //Count?
    //Override?
  ) {
    return await this.postService.findUserPosts(
      requestUserId || currentUserId,
      include,
    );
  }

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async updatePost(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
    @Args('postId') postId: number,
  ) {
    return this.postService.editPost(user, data, postId);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async postLikeToggle(
    @CurrentUser() user: number,
    @Args('postId') postId: number,
  ) {
    return this.postService.postToggleLike(user, postId);
  }

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async postCreateReply(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
    @Args('postId') postId: number,
  ) {
    return this.postService.postNewReply(user, data, postId);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deletePost(
    @CurrentUser() user: number,
    @Args('postId') postId: number,
  ) {
    return this.postService.delete(user, postId);
  }
}
