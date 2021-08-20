import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostInput, Post, PostIncludeOpts } from './post.model';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger('PostService');

  async allPosts() {
    return this.prisma.post.findMany();
  }

  async createPost(id: number, data: CreatePostInput): Promise<Post | null> {
    this.logger.debug(id + ' has posted: ' + data.content);
    /* const post = await this.prisma.post.create({
      data: {
        author: { connect: { id } },
        content: data.content,
      },
      include: { author: true },
    }); */
    const post = await this.prisma.post.create({
      data: {
        author: { connect: { id } },
        content: data.content,
      },
      include: { author: true },
    });
    return post as Post;
  }

  async findUserPosts(
    user: number,
    include: PostIncludeOpts,
    // @TODO PostIncludeOptsIsTheMove100%REMINDER
    // @CHECKOUT UserAuthIncludeOpts<------------
  ) {
    return (await this.prisma.post.findMany({
      where: { authorId: user },
      include: {
        ...include,
        // _COUNT CANNOT HAVE SELF RELATION LIKE REPLIES/PARENT????????????
        _count: { select: { likes: true, history: true } },
      },
    })) as Post[];
  }

  async editPost(
    user: number,
    data: CreatePostInput,
    postId: number,
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
        include: { history: true },
      });
      return newPost;
    }
  }

  async postToggleLike(user: number, postId: number): Promise<Boolean | null> {
    const liked = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { likes: { where: { id: user } } },
    });
    console.log(liked);
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

  async postNewReply(
    user: number,
    data: CreatePostInput,
    postId: number,
  ): Promise<Post | null> {
    const newPost = await this.prisma.post.create({
      data: {
        author: { connect: { id: user } },
        content: data.content,
        isReply: true,
      },
    });

    await this.prisma.postReply.create({
      data: {
        reply: { connect: { id: newPost.id } },
        replyTo: { connect: { id: postId } },
      },
    });

    return newPost;
  }

  async delete(user: number, postId: number): Promise<boolean> {
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
}
