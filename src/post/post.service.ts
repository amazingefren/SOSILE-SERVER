import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async deletePost(
    user: number,
    postId: number,
    isComment: boolean,
  ): Promise<boolean> {
    // @TODO: union prisma <comment+post>
    const prisma = isComment ? this.prisma.comment : this.prisma.post;
    //@ts-ignore
    const check = await prisma.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (check.authorId == user) {
      if (!isComment) {
        await this.prisma.comment.deleteMany({ where: { postId } });
      }
      //@ts-ignore
      await prisma.delete({
        where: { id: postId },
      });
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }

  async togglePostLike(
    user: number,
    postId: number,
    isComment?: boolean,
  ): Promise<Boolean | null> {
    const prisma: any = isComment ? this.prisma.comment : this.prisma.post;
    const liked = await prisma.findUnique({
      where: { id: postId },
      select: { likes: { where: { id: user } } },
    });

    if (liked.likes[0]) {
      await prisma.update({
        where: { id: postId },
        data: { likes: { disconnect: { id: user } } },
        include: { likes: true },
      });
      return false;
    } else {
      await prisma.update({
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

  private async getComments(payload: Comment[]) {
    let result = await this.prisma.comment.findMany({
      where: { id: { in: payload.flatMap(({ id }) => id) } },
      include: {
        _count: true,
        author: true,
      },
    });

    // @TODO test
    result.sort(
      ({ _count: { likes } }, { _count: { likes: likes2 } }) => likes - likes2,
    );

    return result;
  }

  async getPost(where: Prisma.PostWhereUniqueInput, include: PostIncludeOpts) {
    let comments: any = false;
    if (include.comments) {
      comments = { select: { id: true } };
    }
    let data: Post = await this.prisma.post.findUnique({
      where,
      include: {
        ...include,
        comments,
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (include.comments) {
      data.comments = await this.getComments(data.comments);
    }

    return data;
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
      orderBy: { date: 'desc' },
    })) as Post[];
  }

  /*
   * This function is to prevent selection on post.likes sql to user only,
   * that way field.liked can be true, when field.likes is also requested
   */
  async getLiked(
    user: number,
    payload: Post[] | Comment[],
    comment: boolean = false,
  ): Promise<Post[] | Comment[]> {
    let postIds = [];
    payload.forEach((post: Post | Comment) => {
      postIds.push(post.id);
    });
    let result = payload;
    const data = comment
      ? await this.prisma.comment.findMany({
          where: { id: { in: postIds } },
          select: { likes: { where: { id: user } }, id: true },
        })
      : await this.prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { likes: { where: { id: user } }, id: true },
        });
    data.forEach(({ likes, id: postId }) => {
      let index = result.map((post: Post | Comment) => post.id).indexOf(postId);
      if (likes[0]?.id === user) {
        result[index].liked = true;
      } else {
        result[index].liked = false;
      }
    });

    return comment ? (result as Comment[]) : (result as Post[]);
  }

  /* async getComments(postId: number) {
    return await this.prisma.comment.findMany({
      where: { postId },
      include: { _count: true, author: true, likes: true },
    });
  } */

  async getFeed(
    user: number,
    include: PostIncludeOpts,
  ): Promise<FeedPost[] | null> {
    const targets = await this.prisma.follow
      .findMany({
        where: { followerId: user },
        select: { followingId: true },
      })
      .then((d) => {
        let targetIds: number[] = d.flatMap(({ followingId }) => followingId);
        targetIds.push(user as number);
        return targetIds;
      });
    let data = await this.prisma.post.findMany({
      // where: { author: { followers: { some: { followerId: user } } } },
      where: {
        authorId: { in: targets },
      },
      include: {
        ...include,
        likes: { where: { id: user } },
        author: { select: { id: true } },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { date: 'desc' },
      // take: 30,
    });

    let searchUsers = {};
    data.forEach((item, index) => {
      searchUsers[item.author.id] = searchUsers[item.author.id]
        ? [...searchUsers[item.authorId], index]
        : [index];
    });

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
