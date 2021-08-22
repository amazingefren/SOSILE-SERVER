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

  /**
   * SHOW search_paths
   * SET search_paths TO {schema name}
   * CREATE EXTENSION pg_trgm
   * SET pg_trgm.similarity_threshold = 0.8;
   * CREATE INDEX CONCURRENTLY index_user_on_username_trigram ON "User" USING gin (username gin_trgm_ops);
   * SELECT {} FROM "User" WHERE username iLIKE '%wha%te%ver%';
   */
  async userSearch(search: string) {
    // PROCESS search INPUT HERE
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // This will work for now, in real-world, indexing + sml_score filter for performance
    const data = await this.prisma.$queryRaw(
      `SELECT *, similarity(username, '${search}') AS sml FROM "User" ORDER BY sml DESC LIMIT 5`,
    );
    console.log(data);
    return data as User[];
  }
}
