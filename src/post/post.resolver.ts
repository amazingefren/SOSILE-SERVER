import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreatePostInput,
  Post,
  Comment,
  PostIncludeOpts,
  CommentIncludeOpts,
  FeedPost,
  PostWhereInput,
} from './post.model';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { PostService } from './post.service';
import { Fields } from 'src/graphql/fields.decorator';
import { UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(() => [Post])
  async debugPosts(@Fields(PostIncludeOpts) opts: PostIncludeOpts) {
    return this.postService.allPosts(opts);
  }

  /* MUTATIONS */
  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async createPost(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
    @Fields(PostIncludeOpts) opts: PostIncludeOpts,
  ) {
    return this.postService.createPost(user, data, opts).catch(() => {
      throw new Error('Something Went Wrong!');
    });
  }

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async editPost(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
    @Args('postId') postId: number,
    @Fields(PostIncludeOpts) opts: PostIncludeOpts,
  ) {
    return this.postService.editPost(user, data, postId, opts).catch(() => {
      throw new Error('Not Found');
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deletePost(
    @CurrentUser() user: number,
    @Args('postId') postId: number,
  ) {
    return this.postService.deletePost(user, postId).catch(() => {
      throw new Error('Not Found');
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async postLikeToggle(
    @CurrentUser() user: number,
    @Args('postId') postId: number,
  ) {
    return await this.postService.togglePostLike(user, postId).catch(() => {
      throw new Error('Not Found');
    });
  }

  @Mutation(() => Comment)
  @UseGuards(AuthGuard)
  async createComment(
    @CurrentUser() user: number,
    @Args('data') data: CreatePostInput,
    @Args('postId') postId: number,
    @Fields(CommentIncludeOpts) opts: CommentIncludeOpts,
  ) {
    return this.postService
      .createComment(user, data, postId, opts)
      .catch(() => {
        throw new Error('Something Went Wrong');
      });
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteComment(
    @CurrentUser() user: number,
    @Args('commentId') commentId: number,
  ) {
    return this.postService.deleteComment(user, commentId).catch(() => {
      throw new Error('Not Found');
    });
  }

  @Query(() => Post, { nullable: true })
  @UseGuards(AuthGuard)
  async findPost(
    // @CurrentUser() user: number,
    @Fields(PostIncludeOpts) opts: PostIncludeOpts,
    @Args('id') postId: number,
  ) {
    return this.postService.findPost({ id: postId }, opts).catch(() => {
      throw new Error('Not Found');
    });
  }

  /* QUERY */
  @Query(() => [Post], { nullable: true })
  @UseGuards(AuthGuard)
  async findPostByUser(
    @CurrentUser() currentUserId: number,
    @Fields(PostIncludeOpts) opts: PostIncludeOpts,
    @Args('where', { nullable: true }) where?: PostWhereInput,
  ) {
    const payload = await this.postService
      .findUserPosts(where || { id: currentUserId }, opts)
      .catch(() => {
        throw new Error('Not Found');
      });
    const final = await this.postService.getLiked(currentUserId, payload);
    console.log(final);

    return final;
  }

  @Query(() => [FeedPost], { nullable: true })
  @UseGuards(AuthGuard)
  async getFeed(
    @CurrentUser() currentUserId: number,
    @Fields(PostIncludeOpts) opts: PostIncludeOpts,
  ) {
    return await this.postService.getFeed(currentUserId, opts).catch(() => {
      throw new Error('Not Found');
    });
  }
}
