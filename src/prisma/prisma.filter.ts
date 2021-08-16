/* import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client'

@Catch(
  Prisma.PrismaClientKnownRequestError,

)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const rep = ctx.getResponse<FastifyReply>();
    const response = exception.message

    


    // console.log(req)
    console.log(rep)
    console.log(ctx)

    // console.log(status)
  }
} */
