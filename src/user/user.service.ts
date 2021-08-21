import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserIncludeOpts } from './user.model';
// import { UserCreateInput } from './user.model';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async allUsers(include: UserIncludeOpts): Promise<User[] | null> {
    const users = await this.prisma.user.findMany({ include });
    return users;
  }

  async findUser(
    where: Prisma.UserWhereUniqueInput,
    include: UserIncludeOpts,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where, include });
    return user as User;
  }

  async userFollow(
    follower: number,
    following: number,
  ): Promise<Boolean | null> {
    if (follower != following) {
      await this.prisma.user.update({
        where: { id: follower },
        data: {
          following: {
            create: {
              followingId: following,
            },
          },
        },
      });
      return true;
    } else {
      return false;
    }
  }
  async userUnfollow(
    follower: number,
    following: number,
  ): Promise<Boolean | null> {
    if (follower != following) {
      await this.prisma.user.update({
        where: { id: follower },
        data: {
          following: {
            delete: {
              followerId_followingId: {
                followingId: following,
                followerId: follower,
              },
            },
          },
        },
        include: { following: true },
      });
      return true;
    } else {
      return false;
    }
  }
}
