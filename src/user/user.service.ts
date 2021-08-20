import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserAuthIncludeOpts, UserProfile } from './user.model';
// import { UserCreateInput } from './user.model';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async allUsers(): Promise<User[] | null> {
    const user = await this.prisma.user.findMany();
    return user;
  }

  /**
   * Search for user in database
   * @param where number
   * @param include? UserAuthIncludeOpts (optional)
   * @returns User
   */
  async user(
    where: Prisma.UserWhereUniqueInput,
    include?: UserAuthIncludeOpts,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where, include });
    return user as User;
  }

  async userFollow(follower: number, following: number): Promise<User | null> {
    const updated = await this.prisma.user.update({
      where: { id: follower },
      data: {
        /* following: {
          connectOrCreate: {
            where: { id: following },
            create: { User: { connect: { id: following } } },
          }, 
      }, */
        // following: { connect: { id: following } },
        following: { create: { following: { connect: { id: following } } } },
      },
      include: { following: true },
    });
    console.log(updated);
    return updated;
  }

  async userUnfollow(
    follower: number,
    following: number,
  ): Promise<User | null> {
    const updated = await this.prisma.user.update({
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
    return updated;
  }
}
