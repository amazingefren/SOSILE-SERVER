import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
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
    await this.prisma.user.create({data})
    return true
  }

  async LoginUser(data: AuthLoginUserInput): Promise<User | Error>{
    const {password, ...user} = await this.prisma.user.findUnique({where: {username: data.username}})
    if (user && data.password == password){
      return user as User 
    } else {
      throw new UnauthorizedException()
    }
  }
}
