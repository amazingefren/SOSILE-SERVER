import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePostInput,
  Post,
  PostIncludeOpts,
  Comment,
  CommentIncludeOpts,
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

  async findUserPosts(user: number, include: PostIncludeOpts) {
    return (await this.prisma.post.findMany({
      where: { authorId: user },
      include: {
        ...include,
        _count: { select: { likes: true, comments: true } },
      },
    })) as Post[];
  }
}
