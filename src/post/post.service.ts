import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostInput, Post } from './post.model';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger('PostService');

  async allPosts() {
    return this.prisma.post.findMany();
  }

  async createPost(id: number, data: CreatePostInput): Promise<Post | null> {
    this.logger.debug(id + ' has posted: ' + data.content);
    const post = await this.prisma.post.create({
      data: {
        author: { connect: { id } },
        content: data.content,
      },
      include: { author: true },
    });
    return post as Post;
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
}
