import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { User, UserIncludeOpts, UserProfile } from './user.model';
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
    originalUser?: number,
  ): Promise<User | null> {
    let user: User = await this.prisma.user.findUnique({ where, include });
    // user.followed = await this.prisma.user.findUnique({where, select})
    console.log(originalUser);
    // if (
    const following = await this.prisma.user.findUnique({
      where,
      select: { followers: { where: { followerId: originalUser } } },
    });
    if (following.followers[0]) {
      user.followed = true;
    } else {
      user.followed = false;
    }
    return user as User;
  }

  async userProfile(user: number | string): Promise<UserProfile | null> {
    let profile: UserProfile;
    if (typeof user === 'number') {
      let id = user;
      profile = await this.prisma.userProfile.findUnique({
        where: { id },
      });
    }
    if (typeof user === 'string') {
      let username = user;
      profile = await this.prisma.userProfile.findUnique({
        where: { username },
      });
    }
    console.log(profile);
    return profile;
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

  /** @IMPORTANT
   * SHOW search_paths
   * SET search_paths TO {schema name} // i'm using "PUBLIC"
   * CREATE EXTENSION pg_trgm
   * SET pg_trgm.similarity_threshold = 0.8;
   * CREATE INDEX CONCURRENTLY index_user_on_username_trigram ON "User" USING gin (username gin_trgm_ops);
   * SELECT {} FROM "User" WHERE username iLIKE '%wha%te%ver%';
   */
  async userSearch(search: string) {
    // PROCESS search INPUT HERE
    // @NOTE THIS IS UNSAFE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // const temp = /[a-zA-Z0-9]/.test(search)
    // console.log(temp);
    // This will work for now, in real-world, indexing + sml_score filter for performance
    let data = [];
    // if(temp){
    console.log(search);
    data = await this.prisma.$queryRaw(
      // 'SELECT id,username,similarity(username, $1) AS sml FROM "User" ORDER BY sml DESC LIMIT 5;',
      'SELECT * FROM (SELECT *, similarity(username, $1) AS sml FROM "User" ORDER BY sml DESC LIMIT 5) AS "USER" WHERE "USER".sml>0.05;',
      search,
    );
    // }
    // Elasticsearch Probably
    // But this is just a demo anyways
    console.log(data);
    return data as User[];
  }
}
