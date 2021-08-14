import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { User, Prisma } from '@prisma/client'
// import { UserCreateInput } from './user.model';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ){}

  async user(where: Prisma.UserWhereUniqueInput): Promise<User | null>{
    const user = await this.prisma.user.findUnique({where})
    return user
  }

  /* async create(data: UserCreateInput){
    const user = await this.prisma.user.create({data})
    console.log(user)
    return user
  } */

}
