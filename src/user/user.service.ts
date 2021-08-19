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
}
