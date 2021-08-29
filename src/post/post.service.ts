import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.model';
import {
  CreatePostInput,
  Post,
  PostIncludeOpts,
  Comment,
  CommentIncludeOpts,
  FeedPost,
} from './post.model';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger('PostService');

  async allPosts(include: PostIncludeOpts) {
    return this.prisma.post.findMany({ include });
  }

  /* MUTATION */
  // Create Post
  async createPost(
    id: number,
    data: CreatePostInput,
    include: PostIncludeOpts,
  ): Promise<Post | null> {
    const post = await this.prisma.post.create({
      data: {
        author: { connect: { id } },
        content: data.content,
      },
      include,
    });
    return post as Post;
  }

  // Edit Post
  async editPost(
    user: number,
    data: CreatePostInput,
    postId: number,
    include: PostIncludeOpts,
  ): Promise<Post | null> {
    const old = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (old.authorId != user) {
      throw new UnauthorizedException();
    } else {
      const newPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          content: data.content,
          history: { create: { content: old.content, date: old.updated } },
        },
        include,
      });
      return newPost;
    }
  }

  async deletePost(user: number, postId: number): Promise<boolean> {
    const check = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (check.authorId == user) {
      await this.prisma.post.delete({
        where: { id: postId },
      });
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }

  async togglePostLike(user: number, postId: number): Promise<Boolean | null> {
    const liked = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { likes: { where: { id: user } } },
    });

    if (liked.likes[0]) {
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { disconnect: { id: user } } },
        include: { likes: true },
      });
      return false;
    } else {
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { connect: { id: user } } },
        include: { likes: true },
      });
      return true;
    }
  }

  async createComment(
    user: number,
    data: CreatePostInput,
    postId: number,
    include: CommentIncludeOpts,
  ): Promise<Comment | null> {
    const newComment = await this.prisma.comment.create({
      data: {
        author: { connect: { id: user } },
        content: data.content,
        post: { connect: { id: postId } },
      },
      include,
    });
    return newComment as Comment;
  }

  async deleteComment(user: number, commentId: number): Promise<boolean> {
    const check = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });
    if (check.authorId == user) {
      await this.prisma.comment.delete({
        where: { id: commentId },
      });
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }

  async findUserPosts(
    user: Prisma.UserWhereUniqueInput,
    include: PostIncludeOpts,
  ) {
    let where: Prisma.PostWhereInput;
    if (user.id) {
      where = { authorId: user.id };
    }
    if (user.username) {
      where = { author: { username: user.username } };
    }
    return (await this.prisma.post.findMany({
      where,
      include: {
        ...include,
        _count: { select: { likes: true, comments: true } },
      },
    })) as Post[];
  }

  /*
   * This function is to prevent selection on post.likes sql to user only,
   * that way field.liked can be true, when field.likes is also requested
   */
  async getLiked(user: number, payload: Post[]) {
    let postIds = [];
    payload.forEach((post) => {
      postIds.push(post.id);
    });
    let result = payload;
    const data = await this.prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { likes: { where: { id: user } }, id: true },
    });
    data.forEach(({ likes, id: postId }) => {
      let index = result.map((post) => post.id).indexOf(postId);
      if (likes[0]?.id === user) {
        result[index].liked = true;
      } else {
        result[index].liked = false;
      }
    });

    return result;
  }

  async getFeed(
    user: number,
    include: PostIncludeOpts,
  ): Promise<FeedPost[] | null> {
    let data = await this.prisma.post.findMany({
      where: { author: { followers: { some: { followerId: user } } } },
      include: {
        ...include,
        likes: { where: { id: user } },
        author: { select: { id: true } },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 12,
    });

    let searchUsers = {};
    data.forEach((item, index) => {
      /* console.log(item)
      console.log(index) */
      searchUsers[item.author.id] = searchUsers[item.author.id]
        ? [...searchUsers[item.authorId], index]
        : [index];
    });
    // console.log(searchUsers)

    /* half the time of all 30 methods i've tried */
    /* I spent way too long on this and probably isn't even worth it */
    /* OVERALL 50% REDUCTION COMPARED TO ANY OTHER METHOD, I WONT BE LOADING A MILLION POSTS AT
     * A TIME SO THIS WILL WORK*/
    /* leaving the rest of the comments for now, wanna test some more*/
    /* @NOTE: prisma breaks when including relation _count */
    /* @NOTE2: by doing this, i can avoid a seperate call for client*/
    /* and pull author follower count, I honestly should've just a seperate call */
    /* but this was fun */

    let payload = [];

    for (const id of Object.keys(searchUsers)) {
      const count = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          _count: { select: { followers: true } },
        },
      });
      Object.values(searchUsers[id]).forEach((index: number) => {
        payload[index] = data[index];
        payload[index].author = count;
        if (data[index].likes[0]) {
          payload[index].liked = true;
        } else {
          payload[index].liked = false;
        }
      });
    }

    return payload;
  }
}
