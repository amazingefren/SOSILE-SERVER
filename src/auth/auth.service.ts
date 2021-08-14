import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { AuthLoginUserInput, AuthRegisterUserInput } from './auth.model';
import { User } from '../user/user.model'

/* @Injectable()
export class Handler {
  handle(e: any): Error | null{
      
  }
} */

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService
  ){}

  async RegisterUser(data: AuthRegisterUserInput): Promise<Boolean | Error>{
    try{
      await this.prisma.user.create({data})
      return true
    }finally{}
  }

  async LoginUser(data: AuthLoginUserInput): Promise<User | Error>{
    try{
      const user: User = await this.prisma.user.findUnique({where: {username: data.username}})
      return user
    } finally {}
  }
}
